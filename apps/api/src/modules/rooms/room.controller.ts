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
  Put,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoomStatus, RoomDocument } from './room.schema';
import { Types } from 'mongoose';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  async create(@Body() createRoomDto: CreateRoomDto, @Request() req) {
    return this.roomService.create(createRoomDto, req.user);
  }

  @Get('event/:eventSlug')
  async findAllByEvent(@Param('eventSlug') eventSlug: string) {
    return this.roomService.findByEventSlug(eventSlug);
  }

  @Get(':idOrSlug')
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.roomService.findOne(idOrSlug);
  }

  @Patch(':idOrSlug')
  async update(
    @Param('idOrSlug') idOrSlug: string,
    @Body() updateRoomDto: UpdateRoomDto,
    @Request() req,
  ) {
    const room = await this.roomService.findOne(idOrSlug) as RoomDocument;
    if (!room) {
      throw new NotFoundException(`Room ${idOrSlug} not found`);
    }
    return this.roomService.update(room._id.toString(), updateRoomDto);
  }

  @Delete(':idOrSlug')
  async remove(@Param('idOrSlug') idOrSlug: string, @Request() req) {
    const room = await this.roomService.findOne(idOrSlug) as RoomDocument;
    if (!room) {
      throw new NotFoundException(`Room ${idOrSlug} not found`);
    }
    return this.roomService.remove(room._id.toString());
  }

  @Post(':idOrSlug/stream/start')
  async startStream(@Param('idOrSlug') idOrSlug: string, @Request() req) {
    try {
      const room = await this.roomService.findOne(idOrSlug) as RoomDocument;
      if (!room) {
        throw new NotFoundException(`Room ${idOrSlug} not found`);
      }
      return this.roomService.startStream(room._id.toString());
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':idOrSlug/stream/pause')
  async pauseStream(@Param('idOrSlug') idOrSlug: string, @Request() req) {
    try {
      const room = await this.roomService.findOne(idOrSlug) as RoomDocument;
      if (!room) {
        throw new NotFoundException(`Room ${idOrSlug} not found`);
      }
      return this.roomService.pauseStream(room._id.toString());
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':idOrSlug/stream/stop')
  async stopStream(@Param('idOrSlug') idOrSlug: string, @Request() req) {
    try {
      const room = await this.roomService.findOne(idOrSlug) as RoomDocument;
      if (!room) {
        throw new NotFoundException(`Room ${idOrSlug} not found`);
      }
      return this.roomService.stopStream(room._id.toString());
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':idOrSlug/cancel')
  async cancelRoom(@Param('idOrSlug') idOrSlug: string, @Request() req) {
    try {
      const room = await this.roomService.findOne(idOrSlug) as RoomDocument;
      if (!room) {
        throw new NotFoundException(`Room ${idOrSlug} not found`);
      }
      return this.roomService.updateStatus(room._id.toString(), RoomStatus.CANCELLED);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':idOrSlug/reactivate')
  async reactivateRoom(@Param('idOrSlug') idOrSlug: string, @Request() req) {
    try {
      const room = await this.roomService.findOne(idOrSlug) as RoomDocument;
      if (!room) {
        throw new NotFoundException(`Room ${idOrSlug} not found`);
      }
      return this.roomService.updateStatus(room._id.toString(), RoomStatus.UPCOMING);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':idOrSlug/stream')
  async getStreamInfo(@Param('idOrSlug') idOrSlug: string, @Request() req) {
    const room = await this.roomService.findOne(idOrSlug) as RoomDocument;
    if (!room) {
      throw new NotFoundException(`Room ${idOrSlug} not found`);
    }
    return this.roomService.getStreamInfo(room._id.toString());
  }

  @Post(':idOrSlug/end')
  async endRoom(@Param('idOrSlug') idOrSlug: string, @Request() req) {
    const room = await this.roomService.findOne(idOrSlug) as RoomDocument;
    if (!room) {
      throw new NotFoundException(`Room ${idOrSlug} not found`);
    }
    return this.roomService.endRoom(room._id.toString());
  }

  @Put(':idOrSlug/speakers')
  async updateSpeakers(
    @Param('idOrSlug') idOrSlug: string,
    @Body('speakers') speakers: string[],
    @Request() req,
  ) {
    try {
      const room = await this.roomService.findOne(idOrSlug) as RoomDocument;
      if (!room) {
        throw new NotFoundException(`Room ${idOrSlug} not found`);
      }
      return await this.roomService.updateSpeakers(room._id.toString(), speakers);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':idOrSlug/moderators')
  async updateModerators(
    @Param('idOrSlug') idOrSlug: string,
    @Body('moderators') moderators: string[],
    @Request() req,
  ) {
    try {
      const room = await this.roomService.findOne(idOrSlug) as RoomDocument;
      if (!room) {
        throw new NotFoundException(`Room ${idOrSlug} not found`);
      }
      return await this.roomService.updateModerators(room._id.toString(), moderators);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':idOrSlug/join')
  joinRoom(@Request() req, @Param('idOrSlug') idOrSlug: string) {
    return this.roomService.addParticipant(idOrSlug, req.user.id);
  }

  @Post(':idOrSlug/leave')
  leaveRoom(@Request() req, @Param('idOrSlug') idOrSlug: string) {
    return this.roomService.removeParticipant(idOrSlug, req.user.id);
  }

  @Post(':idOrSlug/stream-info')
  updateStreamInfo(
    @Param('idOrSlug') idOrSlug: string,
    @Body() body: { streamKey: string; streamUrl: string },
  ) {
    return this.roomService.updateStreamInfo(
      idOrSlug,
      body.streamKey,
      body.streamUrl,
    );
  }
}
