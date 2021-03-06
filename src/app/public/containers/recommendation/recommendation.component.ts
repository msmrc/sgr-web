import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormService } from '../../shared/services/form.service';
import { LayoutService } from '../../shared/services/layout.service';
import { RecommendationService } from '../../shared/services/recommendation.service';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { FormConverter } from '../../shared/tools/form-converter';
import { LocalStorageService } from '../../shared/services/localstorage.service';
import { ResultInterface } from '../../shared/types/data/recommendation-results.inerface';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { EmailModalDialog } from '../../shared/components/modals/email-modal-dialog/email-modal-dialog.component';

@Component({
  selector: 'app-recommendation',
  styleUrls: ['./recommendation.component.scss'],
  templateUrl: './recommendation.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class RecommendationComponent implements OnInit {
  public isLoading: boolean = false;
  public isError: boolean = false;
  public isDetailedAttention: boolean = false;
  public errorText: string = '';

  public questionnaire: any;
  public recommendationList: ResultInterface[] = [];
  public prevRecommendationList: ResultInterface[] = [];

  public emailForm!: FormGroup;

  constructor(
    public dialog: MatDialog,
    private _router: Router,
    private _fb: FormBuilder,
    private _formService: FormService,
    private _layoutService: LayoutService,
    private _localstorageService: LocalStorageService,
    private _recommendationService: RecommendationService
  ) {}

  ngOnInit() {
    this.isDetailedAttention = false;
    this._layoutService.setCurrentPageConfig({
      title: 'Результаты подбора',
      subTitle: 'Ознакомьтесь с Вашими результатами',
    });

    this.prevRecommendationList = this._localstorageService
      .getResults()
      ?.prev?.slice(0, 5);

    this._getRecommendation();

    this.emailForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]]
    })
  }

  public tryAgain() {
    this._getRecommendation();
  }

  public doNewAnket() {
    this._router.navigate(['/']);
  }

  public onRegister() {
    window.open('https://startupguide.innoagency.ru/', '_blank');
  }

  public subscribeEmail() {
    if(this.emailForm.invalid) {
      return;
    }

    const dialogRef = this.dialog.open(EmailModalDialog, {
      height: '390px',
      width: '485px',
    });

    dialogRef.afterClosed().subscribe(() => { });
  }

  private _getRecommendation() {
    this.isError = false;
    this.isLoading = true;

    // Создаем переиспользуемый observable, с логикой запросов - если тип Express - отправляем на аналитику экспресса, иначе в Detailed
    const recommendation$ = this._formService.getForm().pipe(
      switchMap((formObject) => {
        if (!formObject) {
          throw 'err_no_form';
        }

        this.questionnaire = formObject;
        if (formObject.type === 'express') {
          const requestForm = FormConverter.convertExpressForm(formObject.form);
          return this._recommendationService.getExpressRecommendation(
            requestForm
          );
        } else {
          // throw 'err_detailed';
          const requestForm = FormConverter.convertDetailedForm(
            formObject.form
          );

          console.log('In Detailed: ', requestForm);
          return this._recommendationService.getDetailedRecommendation(
            requestForm
          );
        }
      })
    );

    // Проверяем готовность АПИ методом checkAPI(), если всё хорошо используем поток Observable для получения рекомендаций
    // Иначе вызываем initAPI(), для подготовки
    this._recommendationService
      .checkAPI()
      .pipe(
        switchMap((isAPIready) => {
          if (isAPIready.status === 'data not loaded') {
            return this._recommendationService.initAPI().pipe(
              switchMap((isAPIinit) => {
                if (isAPIinit.status === 'ok') {
                  return recommendation$;
                } else {
                  // Добавить обработку ошибки (нет соединения с сервером / произошла ошибка на сервере, попробуйте еще раз)
                  return recommendation$;
                }
              })
            );
          } else {
            return recommendation$;
          }
        })
      )
      .subscribe(
        (response) => {
          this.isLoading = false;
          this.recommendationList = response;
          const newRecommendationList: ResultInterface[] = response;
          this._localstorageService.setResults(newRecommendationList);
        },
        (error) => {
          console.log('IN ERROR', error);
          if (error === 'err_no_form') {
            this.errorText = 'Вы не заполнили анкету.';
          } else {
            this.errorText = 'Не удалось подобрать сервисы.';
          }

          if(error === 'err_detailed') {
            this.isDetailedAttention = true;
          }
          this.isError = true;
          this.isLoading = false;
        }
      );
  }
}
