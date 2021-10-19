import { Component, OnInit } from '@angular/core';
import { FormService } from '../../shared/services/form.service';
import { LayoutService } from '../../shared/services/layout.service';
import { RecommendationService } from '../../shared/services/recommendation.service';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { FormConverter } from '../../shared/tools/form-converter';
@Component({
  selector: 'app-recommendation',
  styleUrls: ['./recommendation.component.scss'],
  templateUrl: './recommendation.component.html',
})
export class RecommendationComponent implements OnInit {
  public isLoading: boolean = false;

  public questionnaire: any;

  constructor(
    private _router: Router,
    private _formService: FormService,
    private _layoutService: LayoutService,
    private _recommendationService: RecommendationService
  ) {}

  ngOnInit() {
    this._layoutService.setCurrentPageConfig({
      title: 'Результаты подбора',
      subTitle: 'Ознакомьтесь с Вашими результатами',
    });

    // this.isLoading = true;
    this._recommendationService
      .checkAPI()
      .pipe(
        switchMap((isAPIready) => {
          if (isAPIready.status === 'data not loaded') {
            return this._recommendationService.initAPI().pipe(
              switchMap((isAPIinit) => {
                if (isAPIinit.status === 'ok') {
                  return this._formService.getForm().pipe(
                    switchMap((formObject) => {
                      console.log('FORM: ', formObject);
                      if (!formObject) {
                        this._router.navigate(['/']);
                      }

                      this.questionnaire = formObject;
                      if (formObject.type === 'express') {
                        const requestForm = FormConverter.convertExpressForm(
                          formObject.form
                        );

                        console.log('In Express: ', requestForm);
                        return this._recommendationService.getExpressRecommendation(
                          requestForm
                        );
                      } else {
                        const requestForm = FormConverter.convertDetailedForm(
                          formObject.form
                        );

                        console.log('In Detailed: ', requestForm);
                        return this._recommendationService.getDetailedRecommendation(
                          formObject
                        );
                      }
                    })
                  );
                } else {
                  return this._formService.getForm().pipe(
                    switchMap((formObject) => {
                      console.log('FORM: ', formObject);
                      if (!formObject) {
                        this._router.navigate(['/']);
                      }

                      this.questionnaire = formObject;
                      if (formObject.type === 'express') {
                        const requestForm = FormConverter.convertExpressForm(
                          formObject.form
                        );

                        console.log('In Express: ', requestForm);
                        return this._recommendationService.getExpressRecommendation(
                          requestForm
                        );
                      } else {
                        const requestForm = FormConverter.convertDetailedForm(
                          formObject.form
                        );

                        console.log('In Detailed: ', requestForm);
                        return this._recommendationService.getDetailedRecommendation(
                          formObject
                        );
                      }
                    })
                  );
                }
              })
            );
          } else {
            return this._formService.getForm().pipe(
              switchMap((formObject) => {
                console.log('FORM: ', formObject);
                if (!formObject) {
                  this._router.navigate(['/']);
                }

                this.questionnaire = formObject;
                if (formObject.type === 'express') {
                  const requestForm = FormConverter.convertExpressForm(
                    formObject.form
                  );

                  console.log('In Express: ', requestForm);
                  return this._recommendationService.getExpressRecommendation(
                    requestForm
                  );
                } else {
                  const requestForm = FormConverter.convertDetailedForm(
                    formObject.form
                  );

                  console.log('In Detailed: ', requestForm);
                  return this._recommendationService.getDetailedRecommendation(
                    formObject
                  );
                }
              })
            );
          }
        })
      )
      .subscribe(
        (response) => {
          console.log('response: ', response);
        },
        (error) => {
          console.log('error');
        }
      );

    // this._formService
    //   .getForm()
    //   .pipe(
    //     switchMap((formObject) => {
    //       console.log('FORM: ', formObject);
    //       if (!formObject) {
    //         this._router.navigate(['/']);
    //       }

    //       this.questionnaire = formObject;
    //       if (formObject.type === 'express') {
    //         const requestForm = FormConverter.convertExpressForm(
    //           formObject.form
    //         );

    //         console.log('In Express: ', requestForm);
    //         return this._recommendationService.getExpressRecommendation(
    //           requestForm
    //         );
    //       } else {
    //         const requestForm = FormConverter.convertDetailedForm(
    //           formObject.form
    //         );

    //         console.log('In Detailed: ', requestForm);
    //         return this._recommendationService.getDetailedRecommendation(
    //           formObject
    //         );
    //       }
    //     })
    //   )
    //   .subscribe(
    //     (response) => {
    //       console.log('response: ', response);
    //     },
    //     (error) => {
    //       console.log('error');
    //     }
    //   );

    // subscribe(expressForm => {
    //   this._recommendationService.getExpressRecommendation(expressForm).subscribe(response => {

    //   });
    //   this.isLoading = false
    // })
    // TODO: request to API
    // SAVE TO STATE DATA
  }
}
