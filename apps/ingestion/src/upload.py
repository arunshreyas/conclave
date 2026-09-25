import os
import re
import json
import logging
import psycopg2
from typing import Dict, Any, List
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Load env variables from root .env
load_dotenv()

def get_db_connection():
    """Establish connection to Supabase PostgreSQL database using DIRECT_URL or DATABASE_URL."""
    db_url = os.getenv("DIRECT_URL") or os.getenv("DATABASE_URL")
    if not db_url:
        raise ValueError("DATABASE_URL or DIRECT_URL environment variable is missing.")

    # Parse postgresql://user:password@host:port/dbname safely handling @ in password
    m = re.match(r'^postgresql://([^:]+):(.+)@([^/:]+)(?::(\d+))?/([^?]+)(?:\?(.*))?$', db_url)
    if m:
        user, password, host, port, dbname, query_params = m.groups()
        port = int(port) if port else 5432
        
        conn_kwargs = {
            "dbname": dbname,
            "user": user,
            "password": password,
            "host": host,
            "port": port,
        }
        if query_params and "sslmode=" in query_params:
            ssl_match = re.search(r'sslmode=([^&]+)', query_params)
            if ssl_match:
                conn_kwargs["sslmode"] = ssl_match.group(1)

        return psycopg2.connect(**conn_kwargs)

    return psycopg2.connect(db_url)

from .quality import process_question_pipeline

def init_supabase_pgvector(vector_dim: int):
    """Enable pgvector, create questions table, and create match_questions and get_usable_questions functions in Supabase."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # 1. Enable pgvector extension
            cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
            
            # 2. Create questions table if it doesn't exist
            create_table_sql = f"""
            CREATE TABLE IF NOT EXISTS questions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                question TEXT NOT NULL,
                options JSONB,
                answer TEXT,
                solution TEXT,
                exam TEXT NOT NULL,
                year INTEGER NOT NULL,
                session TEXT,
                shift TEXT,
                subject TEXT NOT NULL,
                chapter TEXT,
                topics TEXT[],
                difficulty TEXT,
                confidence TEXT,
                source_file TEXT,
                source_page INTEGER,
                question_number INTEGER,
                embedding VECTOR({vector_dim}),
                question_type TEXT DEFAULT 'single_correct_mcq',
                question_quality TEXT DEFAULT 'high',
                is_usable BOOLEAN DEFAULT true,
                normalized_question TEXT,
                duplicate_of UUID,
                image_url TEXT,
                image_path TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            """
            cur.execute(create_table_sql)
            
            # 3. Add quality & classification columns if missing
            alter_cols_sql = """
            ALTER TABLE questions ADD COLUMN IF NOT EXISTS confidence TEXT;
            ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'single_correct_mcq';
            ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_quality TEXT DEFAULT 'high';
            ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_usable BOOLEAN DEFAULT true;
            ALTER TABLE questions ADD COLUMN IF NOT EXISTS normalized_question TEXT;
            ALTER TABLE questions ADD COLUMN IF NOT EXISTS duplicate_of UUID;
            ALTER TABLE questions ADD COLUMN IF NOT EXISTS image_url TEXT;
            ALTER TABLE questions ADD COLUMN IF NOT EXISTS image_path TEXT;
            """
            cur.execute(alter_cols_sql)
            
            # 4. Add unique constraint safely
            add_constraint_sql = """
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'unique_source_q'
                ) THEN 
                    ALTER TABLE questions ADD CONSTRAINT unique_source_q UNIQUE (source_file, source_page, question_number);
                END IF;
            END $$;
            """
            cur.execute(add_constraint_sql)

            # 5. Create match_questions function
            match_fn_sql = f"""
            CREATE OR REPLACE FUNCTION match_questions(
                query_embedding vector({vector_dim}),
                match_count INT DEFAULT 10,
                filter_subject TEXT DEFAULT NULL,
                filter_chapter TEXT DEFAULT NULL
            )
            RETURNS TABLE (
                id UUID,
                question TEXT,
                options JSONB,
                answer TEXT,
                solution TEXT,
                exam TEXT,
                year INT,
                subject TEXT,
                chapter TEXT,
                similarity FLOAT
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT
                    q.id,
                    q.question,
                    q.options,
                    q.answer,
                    q.solution,
                    q.exam,
                    q.year,
                    q.subject,
                    q.chapter,
                    1 - (q.embedding <=> query_embedding) AS similarity
                FROM questions q
                WHERE
                    q.is_usable = true
                    AND q.question_quality IN ('high', 'medium')
                    AND (filter_subject IS NULL OR filter_subject = 'Mixed' OR filter_subject = 'ALL' OR q.subject = filter_subject)
                    AND (filter_chapter IS NULL OR filter_chapter = 'Mixed' OR q.chapter = filter_chapter)
                ORDER BY q.embedding <=> query_embedding
                LIMIT match_count;
            END;
            $$;
            """
            cur.execute(match_fn_sql)

            # 6. Create get_usable_questions function
            usable_fn_sql = """
            CREATE OR REPLACE FUNCTION get_usable_questions(
                filter_subject TEXT DEFAULT NULL,
                filter_chapter TEXT DEFAULT NULL,
                limit_count INT DEFAULT 10
            )
            RETURNS SETOF questions
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT *
                FROM questions q
                WHERE q.is_usable = true
                  AND q.question_quality IN ('high', 'medium')
                  AND (filter_subject IS NULL OR filter_subject = 'Mixed' OR filter_subject = 'ALL' OR q.subject = filter_subject)
                  AND (filter_chapter IS NULL OR filter_chapter = 'Mixed' OR q.chapter = filter_chapter OR filter_chapter = ANY(q.topics))
                  AND (
                      (q.question_type IN ('single_correct_mcq', 'multiple_correct_mcq', 'assertion_reason') AND q.options IS NOT NULL AND jsonb_array_length(q.options) >= 2 AND q.answer IS NOT NULL)
                      OR
                      (q.question_type IN ('numerical', 'integer_numerical') AND q.answer IS NOT NULL)
                  )
                LIMIT limit_count;
            END;
            $$;
            """
            cur.execute(usable_fn_sql)
            
            conn.commit()
            logger.info("Supabase pgvector schema and get_usable_questions function initialized successfully.")
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed to initialize Supabase pgvector schema: {e}")
        raise
    finally:
        conn.close()

def upload_questions_to_supabase(questions: List[Dict[str, Any]]) -> Dict[str, int]:
    """Upload embedded questions to Supabase PostgreSQL questions table with quality evaluation."""
    conn = get_db_connection()
    conn.autocommit = False
    uploaded_count = 0
    skipped_count = 0
    failed_count = 0

    insert_sql = """
    INSERT INTO questions (
        question, options, answer, solution, exam, year, session, shift,
        subject, chapter, topics, difficulty, confidence,
        source_file, source_page, question_number, embedding,
        question_type, question_quality, is_usable, normalized_question, duplicate_of, image_url, image_path
    ) VALUES (
        %s, %s::jsonb, %s, %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s,
        %s, %s, %s, %s::vector,
        %s, %s, %s, %s, %s, %s, %s
    )
    ON CONFLICT (source_file, source_page, question_number) DO NOTHING;
    """

    total = len(questions)
    for idx, raw_q in enumerate(questions, 1):
        try:
            q = process_question_pipeline(raw_q)
            with conn.cursor() as cur:
                options_json_str = json.dumps(q.get("options") or [])
                topics_list = q.get("topics") or []
                embedding_str = "[" + ",".join(map(str, q["embedding"])) + "]" if q.get("embedding") else None

                cur.execute(insert_sql, (
                    q.get("question"),
                    options_json_str,
                    q.get("answer"),
                    q.get("solution"),
                    q.get("exam"),
                    q.get("year"),
                    q.get("session"),
                    q.get("shift"),
                    q.get("subject"),
                    q.get("chapter"),
                    topics_list,
                    q.get("difficulty"),
                    q.get("confidence"),
                    q.get("source_file"),
                    q.get("source_page"),
                    q.get("question_number"),
                    embedding_str,
                    q.get("question_type"),
                    q.get("question_quality"),
                    q.get("is_usable"),
                    q.get("normalized_question"),
                    q.get("duplicate_of"),
                    q.get("image_url"),
                    q.get("image_path")
                ))
                
                if cur.rowcount > 0:
                    uploaded_count += 1
                else:
                    skipped_count += 1
            
            if idx % 20 == 0 or idx == total:
                conn.commit()
                logger.info(f"Progress: {idx}/{total} questions uploaded (Uploaded: {uploaded_count}, Skipped: {skipped_count}).")
        except Exception as ex:
            conn.rollback()
            failed_count += 1
            logger.error(f"Error inserting question #{raw_q.get('question_number')} from {raw_q.get('source_file')}: {ex}")

    conn.close()

    return {
        "uploaded": uploaded_count,
        "skipped": skipped_count,
        "failed": failed_count
    }
