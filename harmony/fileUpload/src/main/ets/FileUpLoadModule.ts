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
import common from '@ohos.app.ability.common';
import request from '@ohos.request';


export class FileUpLoadModule extends TurboModule implements TM.RNFileupload.Spec{
  constructor(protected ctx: TurboModuleContext) {
    super(ctx);
  }

  upload(options: Object): Promise<string> {
    let files: Object = options['files'][0];
    let context = getContext(this) as common.UIAbilityContext;

    // 上传任务配置项
    let uploadConfig = {
      url: options['uploadUrl'],
      header: options['headers'],
      method: options['method'],
      files: [
        {
          filename: files['filename'],
          name: files['name'],
          uri: 'internal://cache/'+files['filename'],
          type: files['filetype']
        }
      ],
      data: [
        { name: 'file', value: '' }
      ]
    }
    // 将本地应用文件上传至网络服务器
    return new Promise(async (resolve, reject) => {
      try {
        request.uploadFile(context, uploadConfig).then((uploadTask) => {
          uploadTask.on('complete', (taskStates) => {
            for (let i = 0; i < taskStates.length; i++) {
              Logger.info(`FileUpLoad complete taskState: ${JSON.stringify(taskStates[i])}`);
              if (taskStates[i].responseCode == 0) {
                resolve(taskStates[i].message !== '' ? taskStates[i].message : 'File uploaded successfully.');
              }
            }
          });
          uploadTask.on('fail', (taskStates) => {
            for (let i = 0; i < taskStates.length; i++) {
              Logger.info(`FileUpLoad fail taskState: ${JSON.stringify(taskStates[i])}`);
              reject(taskStates[i].message);
            }
          });
        })
          .catch((err) => {
            Logger.error(`FileUpLoad: Invoke uploadFile failed, code is ${err.code}, message is ${err.message}`);
            reject(err.message);
          })
      } catch (err) {
        Logger.error(`FileUpLoad: Invoke uploadFile failed, code is ${err.code}, message is ${err.message}`);
        reject(err.message);
      }
    })
  }
}