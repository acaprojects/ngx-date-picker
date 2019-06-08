import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

import * as dayjs from 'dayjs';

@Component({
    selector: 'app-root',
    templateUrl: `./app.component.html`,
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent {
    public model: { [name: string]: any } = {};

    public ngOnInit(): void {
        this.model.from = dayjs().subtract(2, 'd').valueOf();
        this.model.to = dayjs().add(12, 'M').valueOf();
        this.model.date = dayjs().add(3, 'M').valueOf();
        this.model.events = {};
        this.model.events[`${dayjs().format('YYYY-MM-DD')}`] = Math.floor(Math.random() * 20 + 1);
        this.model.events[`${dayjs().add(2, 'd').format('YYYY-MM-DD')}`] = Math.floor(Math.random() * 20 + 1);
        this.model.events[`${dayjs().add(4, 'd').format('YYYY-MM-DD')}`] = Math.floor(Math.random() * 20 + 1);
        this.model.events[`${dayjs().add(6, 'd').format('YYYY-MM-DD')}`] = Math.floor(Math.random() * 20 + 1);
        this.model.events[`${dayjs().add(1, 'M').format('YYYY-MM-DD')}`] = Math.floor(Math.random() * 20 + 1);
        this.model.events[`${dayjs().add(50, 'd').format('YYYY-MM-DD')}`] = Math.floor(Math.random() * 20 + 1);
        this.model.format = 'dd';
    }

    public reset() {
        this.model.date = dayjs().valueOf();
    }
}
