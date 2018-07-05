import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { CmcService } from '../../services/cmc.service';
import { EosService } from '../../services/eos.service';
import { Account } from '../../models/Account';
import { Action } from '../../models/Action';
import { Observable, combineLatest, from } from 'rxjs';
import { map, switchMap, share, filter } from 'rxjs/operators';

interface AccountRaw extends Account {
  raw: any;
  balance: number;
  ramPrice: number;
  tokens: any[];
  abi?: {
    tables?: any[];
  };
}

@Component({
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  name$: Observable<string>;
  eosPrice$: Observable<number>;
  account$: Observable<AccountRaw>;
  accountTables$: Observable<any[]>;
  accountActionsSent$: Observable<Action[]>;
  accountActionsReceived$: Observable<Action[]>;

  constructor(
    private route: ActivatedRoute,
    private eosService: EosService,
    private accountService: AccountService,
    private cmcService: CmcService
  ) { }

  ngOnInit() {
    this.name$ = this.route.params.pipe(
      map(params => params.id)
    );
    this.eosPrice$ = this.cmcService.getEosPrice();
    this.account$ = this.name$.pipe(
      switchMap(name => this.accountService.getAccount(name)),
      switchMap(account => {
        return combineLatest(
          this.eosService.getAccount(account.name),
          this.eosService.getCurrencyBalance(account.name),
          this.eosService.getRamPrice(),
          this.accountService.getAccountTokens(account.name)
        ).pipe(
          map(([accountRaw, balance, ramPrice, tokens]) => {
            return {
              ...account,
              raw: accountRaw,
              balance: balance,
              ramPrice: ramPrice,
              tokens: tokens
            };
          })
        );
      }),
      share()
    );
    this.accountTables$ = this.account$.pipe(
      filter(account => !!account.abi && !!account.abi.tables),
      switchMap(account => {
        const table$s: Observable<any>[] = account.abi.tables.map(table => {
          return from(
            this.eosService.eos.getTableRows(true, account.name, account.name, table.name, table.key_names[0])
          ).pipe(
            map(tableRows => ({ ...table, ...tableRows }))
          );
        });
        return combineLatest(table$s);
      })
    );
    this.accountActionsSent$ = this.name$.pipe(
      switchMap(name => this.accountService.getAccountActionsSent(name))
    );
    this.accountActionsReceived$ = this.name$.pipe(
      switchMap(name => this.accountService.getAccountActionsReceived(name))
    );
  }

}