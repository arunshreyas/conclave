import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { createClerkClient } from '@clerk/backend';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAuthStatus(clerkId: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { clerkId },
    });

    let clerkUser: any = null;
    if (process.env.CLERK_SECRET_KEY) {
      try {
        const clerkClient = createClerkClient({
          secretKey: process.env.CLERK_SECRET_KEY,
        });
        const user = await clerkClient.users.getUser(clerkId);
        clerkUser = {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
        };
      } catch (err) {
        this.logger.warn(`Could not fetch Clerk user details: ${err}`);
      }
    }

    return {
      authenticated: true,
      clerkId,
      hasProfile: !!profile,
      profile,
      clerkUser,
    };
  }
}
