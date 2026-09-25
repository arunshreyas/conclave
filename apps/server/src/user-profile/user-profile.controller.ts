import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserProfileService } from './user-profile.service';

@Controller('user-profile')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUserId() userId: string) {
    return this.userProfileService.findByUserId(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUserId() userId: string,
    @Body() createUserProfileDto: CreateUserProfileDto,
  ) {
    return this.userProfileService.create(userId, createUserProfileDto);
  }

  @Get('check-username/:username')
  checkUsername(@Param('username') username: string) {
    return this.userProfileService.checkUsername(username);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(
    @CurrentUserId() userId: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.userProfileService.updateByUserId(userId, updateUserProfileDto);
  }
}
