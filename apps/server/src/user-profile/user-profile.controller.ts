import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentClerkId } from '../auth/current-user.decorator';

@Controller('user-profile')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Post()
  @UseGuards(ClerkAuthGuard)
  create(
    @CurrentClerkId() clerkId: string,
    @Body() createUserProfileDto: CreateUserProfileDto,
  ) {
    return this.userProfileService.create(clerkId, createUserProfileDto);
  }

  @Get('me')
  @UseGuards(ClerkAuthGuard)
  getMe(@CurrentClerkId() clerkId: string) {
    return this.userProfileService.findByClerkId(clerkId);
  }

  @Get('check-username/:username')
  checkUsername(@Param('username') username: string) {
    return this.userProfileService.checkUsername(username);
  }

  @Patch('me')
  @UseGuards(ClerkAuthGuard)
  updateMe(
    @CurrentClerkId() clerkId: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.userProfileService.updateByClerkId(clerkId, updateUserProfileDto);
  }

  @Delete('me')
  @UseGuards(ClerkAuthGuard)
  removeMe(@CurrentClerkId() clerkId: string) {
    return this.userProfileService.removeByClerkId(clerkId);
  }
}
