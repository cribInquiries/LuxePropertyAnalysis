import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DatabaseService as prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { EmailService } from '../services/EmailService';

export class AuthController {
  private emailService = new EmailService();

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { firstName, lastName, email, password, phone, role } = req.body;

      // Check if user already exists
      const { data: existingUser } = await prisma.getUserByEmail(email);

      if (existingUser) {
        throw new CustomError('User with this email already exists', 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const { data: user, error } = await prisma.createUser({
        first_name: firstName,
        last_name: lastName,
        email,
        password: hashedPassword,
        phone,
        role: role || 'USER',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw new CustomError('Failed to create user', 500);
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user.id);
      const refreshToken = this.generateRefreshToken(user.id);

      // Send welcome email
      await this.emailService.sendWelcomeEmail(user.email, user.first_name);

      logger.info(`New user registered: ${user.email}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            createdAt: user.created_at,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Find user
      const { data: user, error: userError } = await prisma.getUserByEmail(email);

      if (userError || !user || !user.is_active) {
        throw new CustomError('Invalid credentials', 401);
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new CustomError('Invalid credentials', 401);
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user.id);
      const refreshToken = this.generateRefreshToken(user.id);

      // Update last login
      await prisma.updateUser(user.id, { updated_at: new Date().toISOString() });

      logger.info(`User logged in: ${user.email}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            role: user.role,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { data: user, error } = await prisma.getUserById(req.user!.id);

      if (error || !user) {
        throw new CustomError('User not found', 404);
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { firstName, lastName, phone, bio, avatar } = req.body;

      const { data: user, error } = await prisma.updateUser(req.user!.id, {
        first_name: firstName,
        last_name: lastName,
        phone,
        bio,
        avatar,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw new CustomError('Failed to update profile', 500);
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  public changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const { data: user, error } = await prisma.getUserById(req.user!.id);

      if (error || !user) {
        throw new CustomError('User not found', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new CustomError('Current password is incorrect', 400);
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await prisma.updateUser(user.id, { 
        password: hashedNewPassword,
        updated_at: new Date().toISOString()
      });

      logger.info(`Password changed for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      const { data: user, error } = await prisma.getUserByEmail(email);

      if (!user) {
        // Don't reveal if user exists or not
        res.json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent',
        });
        return;
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password_reset' },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      // Send reset email
      await this.emailService.sendPasswordResetEmail(user.email, user.first_name, resetToken);

      logger.info(`Password reset requested for: ${email}`);

      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
      });
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword } = req.body;

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      if (decoded.type !== 'password_reset') {
        throw new CustomError('Invalid reset token', 400);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await prisma.updateUser(decoded.userId, { 
        password: hashedPassword,
        updated_at: new Date().toISOString()
      });

      logger.info(`Password reset completed for user: ${decoded.userId}`);

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(new CustomError('Invalid or expired reset token', 400));
      } else {
        next(error);
      }
    }
  };

  public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new CustomError('Refresh token is required', 400);
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;

      // Check if user still exists and is active
      const { data: user, error } = await prisma.getUserById(decoded.id);

      if (error || !user || !user.is_active) {
        throw new CustomError('Invalid refresh token', 401);
      }

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user.id);
      const newRefreshToken = this.generateRefreshToken(user.id);

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(new CustomError('Invalid refresh token', 401));
      } else {
        next(error);
      }
    }
  };

  public logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // In a real application, you might want to blacklist the token
      // For now, we'll just return success
      logger.info(`User logged out: ${req.user!.email}`);

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  };

  private generateAccessToken(userId: string): string {
    const secret = process.env.JWT_SECRET!;
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jwt.sign({ id: userId }, secret, { expiresIn } as jwt.SignOptions);
  }

  private generateRefreshToken(userId: string): string {
    const secret = process.env.JWT_REFRESH_SECRET!;
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
    return jwt.sign({ id: userId }, secret, { expiresIn } as jwt.SignOptions);
  }
}
