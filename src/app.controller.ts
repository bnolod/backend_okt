import { Controller, Get, Post, Render, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { bankAccountDto } from './bankAccount.dto';
import { bankAccount } from './bankAccount';
import {appendFile} from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  getHello() {
    return {
      message: this.appService.getHello()
    };
  }


  @Get('kifizetesAdatok')
  @Render('kifizetesAdatok')
  getErrors() {  
    return {
      data : new bankAccountDto(),
      errors : [],
    };
  }
  @Post('kifizetesAdatok')
  kifizetesAdatokPost(
    @Body() bankAccountDto : bankAccountDto,
    @Res() response : Response) {
    const errors = [];
    if (!bankAccountDto.eula) {
      errors.push('Az EULA-t el kell fogadni!');
    }
    if (bankAccountDto.name.replace(/\s+/g, '').length < 1) {
      errors.push('A név legalább 1 karakter hosszú legyen!');
    }
    const regex = /^[0-9]{8}-[0-9]{8}-[0-9]{8}|[0-9]{8}-[0-9]{8}$/;
    if (!regex.test(bankAccountDto.accountNumber)) {
      errors.push('Az bankszámlaszám nem felel meg a formátumnak!');
    }

    if(errors.length > 0) {
      response.render('kifizetesAdatok', {
        errors: errors,
        data: bankAccountDto
      });
      return;
    }
    else {
      response.redirect('/kifizetesSuccess');
    }

    const account : bankAccount = {
      name: bankAccountDto.name,
      accountNumber: bankAccountDto.accountNumber
    }

    appendFile('accounts.csv', `${account.name};${account.accountNumber}\n`, (err) => {
      if (err) {
        console.error('Error :-(', err);
      } else {
        console.log('Adatok mentve');
      }
    });
  
    return;
  }

  @Get('kifizetesSuccess')
  @Render('kifizetesSuccess')
  getSuccess() {
    return;
  }


}
