import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserProfileService {
  constructor(private readonly prisma: PrismaService) {}

  create(createUserProfileDto: CreateUserProfileDto) {
    return this.prisma.userProfile.create({ data: createUserProfileDto });
  }

  findAll() {
    return this.prisma.userProfile.findMany();
  }

  async findOne(id: string) {
    const userProfile = await this.prisma.userProfile.findUnique({ where: { id } });
    if (!userProfile) {
      throw new NotFoundException(`User profile ${id} was not found.`);
    }
    return userProfile;
  }

  async update(id: string, updateUserProfileDto: UpdateUserProfileDto) {
    await this.findOne(id);
    return this.prisma.userProfile.update({
      where: { id },
      data: updateUserProfileDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.userProfile.delete({ where: { id } });
  }
}
