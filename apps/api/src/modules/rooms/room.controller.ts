import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoomStatus } from './room.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { BadRequestException } from '@nestjs/common';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(createRoomDto, req.user.id);
  }

  @Get('event/:eventId')
  @UseGuards(JwtAuthGuard)
  findAll(@Param('eventId') eventId: string) {
    return this.roomService.findAll(eventId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
    @CurrentUser() user: JwtPayload
  ) {
    try {
      const room = await this.roomService.update(id, updateRoomDto);
      return room;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.roomService.remove(id);
  }

  @Post(':id/stream')
  async startStream(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload
  ) {
    try {
      const room = await this.roomService.startStream(id);
      return room;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post(':id/stream/pause')
  async pauseStream(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload
  ) {
    try {
      const room = await this.roomService.pauseStream(id);
      return room;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post(':id/stream/stop')
  async stopStream(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload
  ) {
    try {
      const room = await this.roomService.stopStream(id);
      return room;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post(':id/cancel')
  async cancelRoom(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload
  ) {
    try {
      const room = await this.roomService.updateStatus(id, RoomStatus.CANCELLED);
      return room;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post(':id/reactivate')
  async reactivateRoom(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload
  ) {
    try {
      const room = await this.roomService.updateStatus(id, RoomStatus.UPCOMING);
      return room;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  joinRoom(@Request() req, @Param('id') id: string) {
    return this.roomService.addParticipant(id, req.user.id);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  leaveRoom(@Request() req, @Param('id') id: string) {
    return this.roomService.removeParticipant(id, req.user.id);
  }

  @Post(':id/stream-info')
  @UseGuards(JwtAuthGuard)
  updateStreamInfo(
    @Param('id') id: string,
    @Body() body: { streamKey: string; streamUrl: string },
  ) {
    return this.roomService.updateStreamInfo(id, body.streamKey, body.streamUrl);
  }

  @Post(':id/end')
  @UseGuards(JwtAuthGuard)
  async endRoom(@Param('id') id: string) {
    return this.roomService.endRoom(id);
  }
}
