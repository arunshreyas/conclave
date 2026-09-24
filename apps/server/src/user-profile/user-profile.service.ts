import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async create(clerkId: string, createUserProfileDto: CreateUserProfileDto) {
    const existing = await this.prisma.userProfile.findFirst({
      where: {
        OR: [
          { clerkId },
          { email: createUserProfileDto.email },
          { userName: createUserProfileDto.userName },
        ],
      },
    });

    if (existing) {
      if (existing.clerkId === clerkId) {
        throw new ConflictException('User profile already exists for this account');
      }
      if (existing.email === createUserProfileDto.email) {
        throw new ConflictException('An account with this email already exists');
      }
      if (existing.userName === createUserProfileDto.userName) {
        throw new ConflictException('Username is already taken');
      }
    }

    return this.prisma.userProfile.create({
      data: {
        clerkId,
        email: createUserProfileDto.email,
        name: createUserProfileDto.name,
        userName: createUserProfileDto.userName,
        birthday: new Date(createUserProfileDto.birthday),
        school: createUserProfileDto.school,
        grade: createUserProfileDto.grade,
        stream: createUserProfileDto.stream,
      },
    });
  }

  findAll() {
    return this.prisma.userProfile.findMany();
  }

  async findByClerkId(clerkId: string) {
    const userProfile = await this.prisma.userProfile.findUnique({
      where: { clerkId },
    });
    if (!userProfile) {
      throw new NotFoundException(`User profile for Clerk ID ${clerkId} was not found.`);
    }
    return userProfile;
  }

  async findOne(id: string) {
    const userProfile = await this.prisma.userProfile.findUnique({ where: { id } });
    if (!userProfile) {
      throw new NotFoundException(`User profile ${id} was not found.`);
    }
    return userProfile;
  }

  async checkUsername(userName: string) {
    const existing = await this.prisma.userProfile.findUnique({
      where: { userName },
    });
    return { available: !existing };
  }

  async updateByClerkId(clerkId: string, updateUserProfileDto: UpdateUserProfileDto) {
    const profile = await this.findByClerkId(clerkId);
    const dataToUpdate: any = { ...updateUserProfileDto };
    if (updateUserProfileDto.birthday) {
      dataToUpdate.birthday = new Date(updateUserProfileDto.birthday as any);
    }

    return this.prisma.userProfile.update({
      where: { id: profile.id },
      data: dataToUpdate,
    });
  }

  async removeByClerkId(clerkId: string) {
    const profile = await this.findByClerkId(clerkId);
    return this.prisma.userProfile.delete({ where: { id: profile.id } });
  }
}
