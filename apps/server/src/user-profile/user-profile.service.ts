import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateUserProfileDto) {
    try {
      return await this.prisma.userProfile.create({
        data: {
          userId,
          name: dto.name.trim(),
          userName: dto.userName.trim().toLowerCase(),
          birthday: dto.birthday ? new Date(dto.birthday) : null,
          school: dto.school.trim(),
          grade: dto.grade.trim(),
          stream: dto.stream.trim(),
        },
      });
    } catch (error) {
      this.mapUniqueConstraint(error);
      throw error;
    }
  }

  async findByUserId(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('User profile not found.');
    return profile;
  }

  findAll() {
    return this.prisma.userProfile.findMany();
  }

  async findOne(id: string) {
    const profile = await this.prisma.userProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException(`User profile ${id} was not found.`);
    return profile;
  }

  async checkUsername(userName: string) {
    const existing = await this.prisma.userProfile.findUnique({
      where: { userName: userName.trim().toLowerCase() },
    });
    return { available: !existing };
  }

  async updateByUserId(userId: string, dto: UpdateUserProfileDto) {
    const profile = await this.findByUserId(userId);
    const data = {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.userName !== undefined ? { userName: dto.userName.trim().toLowerCase() } : {}),
      ...(dto.birthday !== undefined ? { birthday: dto.birthday ? new Date(dto.birthday) : null } : {}),
      ...(dto.school !== undefined ? { school: dto.school.trim() } : {}),
      ...(dto.grade !== undefined ? { grade: dto.grade.trim() } : {}),
      ...(dto.stream !== undefined ? { stream: dto.stream.trim() } : {}),
    };

    try {
      return await this.prisma.userProfile.update({ where: { id: profile.id }, data });
    } catch (error) {
      this.mapUniqueConstraint(error);
      throw error;
    }
  }

  private mapUniqueConstraint(error: unknown): void {
    const prismaError = error as { code?: string; meta?: { target?: string | string[] } };
    if (prismaError?.code !== 'P2002') return;
    const target = Array.isArray(prismaError.meta?.target)
      ? prismaError.meta.target.join(',')
      : prismaError.meta?.target ?? '';
    if (target.includes('userId')) {
      throw new ConflictException('A user profile already exists for this account.');
    }
    if (target.includes('userName') || target.includes('username')) {
      throw new ConflictException('Username is already taken.');
    }
    throw new ConflictException('A profile with these details already exists.');
  }
}
