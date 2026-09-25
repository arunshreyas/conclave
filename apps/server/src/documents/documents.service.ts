import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  private extractSyllabusTopicsFromText(text: string) {
    const defaultSyllabus = {
      Physics: ['Work Power Energy', 'Rotational Motion', 'Electrostatics', 'Kinematics', 'Optics'],
      Chemistry: ['Redox Reactions', 'Chemical Bonding', 'Thermodynamics', 'Organic Chemistry'],
      Mathematics: ['Straight Lines', 'Calculus', 'Vectors', 'Probability', 'Matrices'],
    };

    if (!text || text.trim().length === 0) {
      return defaultSyllabus;
    }

    const textLower = text.toLowerCase();
    const extracted: Record<string, string[]> = {
      Physics: [],
      Chemistry: [],
      Mathematics: [],
    };

    const topicKeywords: Record<string, Record<string, string[]>> = {
      Physics: {
        'Work Power Energy': ['work', 'power', 'energy', 'theorem', 'kinetic', 'potential'],
        'Rotational Motion': ['rotation', 'torque', 'moment of inertia', 'angular', 'axis'],
        Electrostatics: ['charge', 'electric field', 'coulomb', 'potential', 'capacitance'],
        Kinematics: ['velocity', 'acceleration', 'motion', 'projectile', 'displacement'],
        Optics: ['wave', 'refraction', 'lens', 'mirror', 'prism', 'diffraction'],
      },
      Chemistry: {
        'Redox Reactions': ['redox', 'oxidation', 'reduction', 'electron', 'electrode'],
        'Chemical Bonding': ['bond', 'orbital', 'hybridization', 'valency', 'molecule'],
        Thermodynamics: ['enthalpy', 'entropy', 'heat', 'isobaric', 'isothermal'],
        'Organic Chemistry': ['alkane', 'alkene', 'alcohol', 'acid', 'hydrocarbon'],
      },
      Mathematics: {
        'Straight Lines': ['line', 'slope', 'distance', 'equation', 'perpendicular', 'parallel'],
        Calculus: ['derivative', 'integration', 'limit', 'function', 'area'],
        Vectors: ['vector', 'dot product', 'cross product', 'magnitude'],
        Probability: ['probability', 'event', 'bayes', 'permutation', 'combination'],
      },
    };

    for (const [subj, topicsMap] of Object.entries(topicKeywords)) {
      for (const [topicName, keywords] of Object.entries(topicsMap)) {
        if (keywords.some((kw) => textLower.includes(kw))) {
          extracted[subj].push(topicName);
        }
      }
    }

    // Ensure at least 1 topic per subject
    for (const [subj, topics] of Object.entries(extracted)) {
      if (topics.length === 0) {
        extracted[subj] = defaultSyllabus[subj as keyof typeof defaultSyllabus].slice(0, 2);
      }
    }

    return extracted;
  }

  async uploadDocument(
    userId: string,
    dto: {
      title: string;
      docType?: string;
      fileType?: string;
      fileUrl?: string;
      text?: string;
    },
  ) {
    const rawText = dto.text || '';
    const extractedSyllabus = this.extractSyllabusTopicsFromText(rawText);

    const doc = await this.prisma.document.create({
      data: {
        userId,
        title: dto.title,
        docType: dto.docType || 'NOTES',
        fileType: dto.fileType || 'pdf',
        fileUrl: dto.fileUrl || null,
        status: 'PROCESSED',
        extractedText: rawText.slice(0, 10000), // truncate if huge
        extractedSyllabus: extractedSyllabus as any,
      },
    });

    // Chunk text if provided
    if (rawText.length > 0) {
      const chunkSize = 500;
      const chunks: string[] = [];
      for (let i = 0; i < rawText.length; i += chunkSize) {
        chunks.push(rawText.slice(i, i + chunkSize));
      }

      await this.prisma.documentChunk.createMany({
        data: chunks.map((content, idx) => ({
          documentId: doc.id,
          content,
          chunkIndex: idx,
        })),
      });
    }

    return {
      documentId: doc.id,
      title: doc.title,
      docType: doc.docType,
      status: doc.status,
      extractedSyllabus,
      createdAt: doc.createdAt,
    };
  }

  async getUserDocuments(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDocumentDetails(userId: string, id: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: { chunks: true },
    });

    if (!doc || doc.userId !== userId) {
      throw new NotFoundException('Document not found');
    }

    return doc;
  }
}
