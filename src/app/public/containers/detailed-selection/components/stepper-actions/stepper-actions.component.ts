import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormService } from 'src/app/public/shared/services/form.service';
import { StepperFormInterface } from 'src/app/public/shared/types/common/stepper-form.interface';

@Component({
  selector: 'app-stepper-actions',
  template: `
    <div class="actions">
      <button type="button" (click)="prevStep()" *ngIf="getIsBackAvaible()">
        Назад
      </button>
      <button
        type="button"
        class="button__accent"
        (click)="nextStep()"
        *ngIf="getIsNextAvaible()"
      >
        Далее
      </button>
      <button
        type="button"
        (click)="applyForm()"
        class="button__accent"
        *ngIf="getIsApplyAvaible()"
      >
        Подобрать
      </button>
    </div>
    <div class="actions">
      <button type="button" (click)="cancel()">Отмена</button>
    </div>
  `,
})
export class StepperActionsComponent implements OnInit {
  @Output()
  onSubmit = new EventEmitter<any>();

  public stepperConfig!: StepperFormInterface;

  constructor(private _formService: FormService) {}

  ngOnInit() {
    this._formService.stepper$.subscribe((stepper) => {
      this.stepperConfig = stepper;
    });
  }

  public applyForm() {
    this.onSubmit.emit();
  }

  public getIsApplyAvaible(): boolean {
    if (this.stepperConfig.currentStepIdx === this.stepperConfig.maxSteps - 1) {
      return true;
    } else {
      return false;
    }
  }

  public getIsNextAvaible(): boolean {
    if (this.stepperConfig.currentStepIdx === this.stepperConfig.maxSteps - 1) {
      return false;
    } else {
      return true;
    }
  }

  public getIsBackAvaible(): boolean {
    if (this.stepperConfig.currentStepIdx === 0) {
      return false;
    } else {
      return true;
    }
  }

  public prevStep() {
    if (this.stepperConfig.currentStepIdx === 0) {
      return;
    }

    this.stepperConfig.currentStepIdx--;
  }

  public nextStep() {
    if (this.stepperConfig.currentStepIdx === this.stepperConfig.maxSteps - 1) {
      return;
    }

    this.stepperConfig.currentStepIdx++;
  }

  public cancel() {}
}
