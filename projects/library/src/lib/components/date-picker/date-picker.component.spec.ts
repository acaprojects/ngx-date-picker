
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ADatePickerComponent } from './date-picker.component';

describe('ADropdownComponent', () => {
    let fixture: ComponentFixture<ADatePickerComponent>;
    let component: ADatePickerComponent;
    let clock: jasmine.Clock;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                ADatePickerComponent
            ],
            imports: [CommonModule, FormsModule]
        }).compileComponents();
        fixture = TestBed.createComponent(ADatePickerComponent);
        component = fixture.debugElement.componentInstance;
        clock = jasmine.clock();
        fixture.detectChanges();
        clock.uninstall();
        clock.install();
    });

    afterEach(() => {
        clock.uninstall();
    });

    it('should create an instance', () => {
        expect(component).toBeTruthy();
    });

    // TODO: add tests
});
