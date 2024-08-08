import {
    UseInterceptors,
    UploadedFiles,
    Param,
    Res,
    Get,
    Post,
    Delete,
    Controller,
} from '@nestjs/common';
import { Response } from 'express'
import { ImageUploadService } from './image-upload.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer'
import { AppError } from 'internal/error/AppError';
import { AppErrorTypeEnum } from 'internal/error/AppErrorTypeEnum';
import { ParseObjectIdPipe } from 'common/pipes/ParseObjectIdPipe.pipe';
import { generateRandom } from 'internal/utils';

@Controller('image-upload')
export class ImageUploadController {
    constructor(private imageUploadService: ImageUploadService) {}

    @Post('upload')
    @UseInterceptors(FilesInterceptor("images", 20, { // TODO create constants
        storage: diskStorage({
            destination: (_, __, cb) => cb(null, './uploads'),
            filename: (_, file, cb) => cb(null, `${generateRandom()}_${file.originalname}`)
        })
    }))
    async uploadFile(
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Res() res: Response
    ) {
        if (!files) {
            throw new AppError(AppErrorTypeEnum.CANNOT_UPLOAD_IMAGE, {
                errorMessage: "No files attached"
            })
        }
        const uploadedImages = await this.imageUploadService.uploadImages(files);
        res.status(200).json(uploadedImages)
    }

    @Get('/')
    async getAllEntries(@Res() response: Response) {
        const entries = await this.imageUploadService.getAllEntities()
        response.status(200).json(entries)
    }

    @Get('/id/:id')
    async getEntryById(@Param('id', ParseObjectIdPipe) id: string, @Res() response: Response) {
        const entry = await this.imageUploadService.getEntityById(id)
        if (entry) {
            response.status(200).send(entry)
        }
        throw new AppError(AppErrorTypeEnum.DB_ENTITY_NOT_FOUND)
    }

    @Get('/collectionName/:collectionName')
    async getEntryByCollectionName(@Param('collectionName') collection: string, @Res() response: Response) {
        const entry = await this.imageUploadService.findOne({collectionName: collection})
        if (entry) {
            response.status(200).send(entry)
        }
        throw new AppError(AppErrorTypeEnum.DB_ENTITY_NOT_FOUND)
    }

    @Delete('/id/:id')
    async removeEntryById(@Param('id', ParseObjectIdPipe) id: string, @Res() response: Response) {
        const execRes = await this.imageUploadService.removeEntityById(id)
        if (execRes) {
            return response.status(200).json({success: true})
        }
            throw new AppError(AppErrorTypeEnum.DB_ENTITY_NOT_FOUND)
    }
}
