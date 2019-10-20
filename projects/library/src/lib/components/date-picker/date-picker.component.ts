import { Component, OnInit, Input, Output, OnChanges, SimpleChanges, forwardRef, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import * as day_api from 'dayjs';
const dayjs = day_api;

export interface IDatePickerOptions {
    /** Unix timestamp with millisecond. First selectable date */
    from?: number;
    /** Unix timestamp with millisecond. Last selectable date */
    to?: number;
    /** Dayjs format string for formatting days of the week. Defaults to `DDD` */
    day_format?: string;
    /** Dayjs format string for formatting active month. Defaults to `MMMM YYYY` */
    month_format?: string;
}

interface IDateBlock {
    /** Timestamp value of the date */
    value: number;
    /** Day of the month to display */
    display: string;
    /** Whether block is the selected date */
    active: boolean;
    /** Whether block not selectable */
    disabled: boolean;
    /** Whether block outside the active month */
    non_month: boolean;
    /** Whether the block is today */
    today: boolean;
    /** Number of events on this block */
    count?: number;
}

@Component({
    selector: 'a-date-picker',
    templateUrl: './date-picker.component.html',
    styleUrls: ['./date-picker.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ADatePickerComponent),
            multi: true
        }
    ]
})
export class ADatePickerComponent implements OnInit, OnChanges, ControlValueAccessor {
    /** CSS class to add to the root element of the component */
    @Input() public klass = 'default';
    /** Counters of the events on given dates. Key format is `YYYY-MM-DD` */
    @Input() public counters: { [date: string]: number };
    /** Settings for the date picker component */
    @Input() public options: IDatePickerOptions;
    /** Offset of the display month from the current month */
    @Output() public month = new EventEmitter<number>();

    public date: number = dayjs().valueOf();

    /** Offset of the month displayed from the current month */
    public offset = 0;
    /** Minimum offset for changing the month */
    public min_offset = -999999;
    /** Maximum offset for changing the month */
    public max_offset = 999999;
    /** Blocks representing the rendering details of the display days of the month */
    public date_list: IDateBlock[] = [];
    /** Name of the actively displayed month */
    public month_name = dayjs().format('MMMM YYYY');
    /** Name of the days of the week to display */
    public days_of_week = [];
    /** First selectable date */
    private from: day_api.Dayjs;
    /** Last selectable date */
    private to: day_api.Dayjs;
    /** Dayjs format string for formatting days of the week. Defaults to `ddd` */
    private day_format = 'ddd';
    /** Dayjs format string for formatting active month. Defaults to `MMMM YYYY` */
    private month_format = 'MMMM YYYY';
    /** Form control on change handler */
    private _onChange: (_: number) => void;
    /** Form control on touch handler */
    private _onTouch: (_: number) => void;
    /** ID of the timer used for changing the month */
    private _change_timer: number;

    public ngOnInit(): void {
        this.generateMonth();
        this.generateDaysOfTheWeek();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.options) {
            this.updateOptions();
        }
        if (changes.counters) {
            this.generateMonth();
        }
    }

    /** Change date using the given block */
    public setDate(item: IDateBlock) {
        this.date = item.value;
        if (this._onChange) {
            this._onChange(this.date);
        }
        this.generateMonth();
    }

    /**
     * Update offset to show the selected date
     */
    public updateDate(): void {
        const now = dayjs().startOf('month');
        const date = dayjs(this.date).startOf('month');
        if (date.isValid()) {
            const difference = date.diff(now, 'month');
            if (this.offset !== difference) {
                this.offset = difference;
                this.month.emit(this.offset);
            }
            this.generateMonth();
        }
    }

    /**
     * Update local properties based off changes to settings
     */
    public updateOptions(): void {
        if (this.options) {
            // Setup from date
            if (this.options.from) {
                this.from = dayjs(this.options.from).startOf('d');;
                const today = dayjs().startOf('month');
                const date = this.from.startOf('month');
                this.min_offset = date.diff(today, 'month');
            } else if (this.from) {
                this.from = null;
                this.min_offset = -999999;
            }
            // Setup to date
            if (this.options.to) {
                this.to = dayjs(this.options.to).startOf('d');
                const today = dayjs().startOf('month');
                const date = this.to.startOf('month');
                this.max_offset = date.diff(today, 'month');
            } else if (this.to) {
                this.to = null;
                this.max_offset = 999999;
            }
            if (this.options.month_format) {
                this.month_format = this.options.month_format || 'MMMM YYYY';
            }
            if (this.options.day_format) {
                this.day_format = this.options.day_format || 'ddd';
                this.generateDaysOfTheWeek();
            }
            // Update date blocks
            this.generateMonth();
        }
    }

    /**
     * Generate the display blocks for the days of the active month
     */
    private generateMonth(): void {
        const today = dayjs();
        const date = dayjs().add(this.offset, 'month');
        const active = dayjs(this.date);
        let start = date.date(1).day(0);
        const end = dayjs(start).add(5, 'week').endOf('week');
        this.date_list = [];
        while (start.isBefore(end, 'd') || start.isSame(end, 'd')) {
            this.date_list.push({
                value: start.valueOf(),
                display: start.format('D'),
                active: active.isSame(start, 'd'),
                non_month: !date.isSame(start, 'month'),
                count: this.counters ? this.counters[start.format('YYYY-MM-DD')] || 0 : 0,
                disabled: (this.from ? start.isBefore(this.from, 'd') : false) || (this.to ? start.isAfter(this.to, 'd') : false),
                today: today.isSame(start, 'd')
            });
            start = start.add(1, 'd');
        }
        this.month_name = date.format(this.month_format);
    }

    /**
     * Generate this weekdays to display in the header of the calendar
     */
    private generateDaysOfTheWeek() {
        let date = dayjs().startOf('week');
        this.days_of_week = [];
        for (let i = 0; i < 7; i++) {
            this.days_of_week.push(date.format(this.day_format));
            date = date.add(1, 'd');
        }
    }

    /**
     * Changes the month offset by the given value.
     * Does nothing if the new month is not available to be selected
     * @param value Number of months to change the offset by
     */
    public changeMonth(value: number): void {
        if (this._change_timer) {
            clearTimeout(this._change_timer);
        }
        this._change_timer = <any>setTimeout(() => {
            const new_offset = this.offset + value;
            const date = dayjs().add(new_offset, 'month');
            if (this.from && date.isBefore(this.from, 'M')) { return; }
            if (this.to && date.isAfter(this.to, 'M')) { return; }
            this.offset = new_offset;
            this.month.emit(this.offset);
            this.generateMonth();
            this._change_timer = null;
        }, 100);
    }

    /**
     * Reset the month offset to the month of the selected date
     */
    public reset() {
        const today = dayjs();
        const date = dayjs(this.date);
        const offset = this.offset;
        this.offset = today.diff(date, 'month');
        if (offset !== this.offset) {
            this.generateMonth();
        }
        this.month.emit(this.offset);
    }

    /**
     * Update local value when form control value is changed
     * @param value The new value for the component
     */
    public writeValue(value: number) {
        this.date = value;
        this.updateDate();
        this.generateMonth();
    }

    /**
     * Registers a callback function that is called when the control's value changes in the UI.
     * @param fn The callback function to register
     */
    public registerOnChange(fn: (_: number) => void): void {
        this._onChange = fn;
    }

    /**
     * Registers a callback function is called by the forms API on initialization to update the form model on blur.
     * @param fn The callback function to register
     */
    public registerOnTouched(fn: (_: number) => void): void {
        this._onTouch = fn;
    }
}
