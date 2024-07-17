/**
 * MIT License
 *
 * Copyright (C) 2024 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { TurboModule, TurboModuleContext } from "@rnoh/react-native-openharmony/ts";
import Logger from './Logger';
import { TM } from '@rnoh/react-native-openharmony/generated/ts';
import request from '@ohos.request';
import { BusinessError } from '@ohos.base';
import { JSON } from '@kit.ArkTS';

export class FileUpLoadModule extends TurboModule implements TM.RNFileupload.Spec{
  constructor(protected ctx: TurboModuleContext) {
    super(ctx);
  }

  upload(options: Object, callback: (err: string, result: string)=>void): void {

    let filesArray = new Array();
    for (let index = 0; index < options['files'].length; index++) {
      let Object = {
        filename: '',
        name: '',
        uri: '',
        type: ''
      };
      let filesItem = options['files'][index];
      Object.filename = filesItem['filename'];
      let path = filesItem['filepath'].substring(0, filesItem['filepath'].lastIndexOf('/'));
      if (path == this.ctx.uiAbilityContext.cacheDir || path == 'file://' + this.ctx.uiAbilityContext.cacheDir) {
        Object.uri = 'internal://cache/' + filesItem['filename'];
      } else if (filesItem['filepath'] == 'internal://cache/' + filesItem['filename']) {
        Object.uri = filesItem['filepath'];
      }
      
      let i = filesItem['filename'].lastIndexOf('.')
      let type = filesItem['filename'].substring(i + 1);
      Object.type = filesItem['filetype'] ? filesItem['filetype'] : type;
      Object.name = filesItem['name'] ? filesItem['name'] : 'file';
      filesArray.push(Object);
    }
    let uploadConfig: request.UploadConfig = {
      url: options['uploadUrl'],
      header: options['headers'],
      method: options['method'],
      files: filesArray,
      data: [
        options['fields']
      ],
    };

    let uploadTask: request.UploadTask;
    let responseMessage: string
    try {
      request.uploadFile(this.ctx.uiAbilityContext, uploadConfig).then((data: request.UploadTask) => {
        uploadTask = data;
        uploadTask.on('complete', (taskStates: Array<request.TaskState>) => {
          for (let i = 0; i < taskStates.length; i++) {
            Logger.info(`FileUpLoad complete taskState: ${JSON.stringify(taskStates)}`);
            if (taskStates[i].responseCode == 0) {
              responseMessage = taskStates[i].message;
            }
          }
          callback('',responseMessage !== '' ? responseMessage : 'File uploaded successfully.');
          removeEvent(uploadTask);
        });
        uploadTask.on('fail', (taskStates: Array<request.TaskState>) => {
          for (let i = 0; i < taskStates.length; i++) {
            Logger.info(`FileUpLoad fail taskState: ${JSON.stringify(taskStates[i])}`);
            responseMessage = taskStates[i].message;
          }
          callback(responseMessage, '');
          removeEvent(uploadTask);
        });
      }).catch((err: BusinessError) => {
        Logger.error(`Failed to request the upload. Code: ${err.code}, message: ${err.message}`);
      });
    } catch (err) {
      Logger.error(`FileUpLoad: Invoke uploadFile failed, code is ${err.code}, message is ${err.message}`);
    callback(err.message,'');
    }
    const removeEvent = (uploadTask) => {
      uploadTask.off('fail');
      uploadTask.off('complete');
    }
  }
}