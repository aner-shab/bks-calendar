import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';

export interface CalendarDate {
	mDate: moment.Moment;
	selected?: boolean;
	today?: boolean;
  }
  
  @Component({
	selector: 'bks-date-picker',
	templateUrl: './date-picker.component.html',
	styleUrls: ['./date-picker.component.scss']
  })
  export class DatePickerComponent implements OnInit {
	currentDate = moment().utc();
	dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
	months = [
		['', '', 'JAN','FEB','MAR','APR','MAY'],
		['JUN', 'JUL','AUG','SEP','OCT','NOV','DEC']
	];
	weeks: CalendarDate[][] = [];
	sortedDates: CalendarDate[] = [];
	currentSelection: CalendarDate;
	inYearSelection: boolean; 
	inClockSelection: boolean;
	inMinutesSelection: boolean;
	inHoursSelection: boolean;
	isExpanded: boolean = false;

	isSelectedMinute: number;
	isHoveredMinute: number;
	isSelectedHour: number;
	isHoveredHour: number;

	@Input() initialDate: moment.Moment;
	@Input() clock: boolean;
	@Output() onSelectDate = new EventEmitter<moment.Moment>();
	
	constructor() {
	}

	onExpand(){
		this.isExpanded = !this.isExpanded;
	}
  
	ngOnInit(): void {
		this.inYearSelection = false;
		this.inClockSelection = false;
		this.generateCalendar();
		if (!this.initialDate){	
			this.initialDate = moment.utc();
		}

		this.currentDate = this.initialDate.clone();
		
		this.generateCalendar();
		this.initSelect(this.initialDate);
	}

	initSelect(date: moment.Moment){
		for (let week of this.weeks){
			for (let day of week){
			if (day.mDate.date() == date.date() && day.mDate.month() == date.month()){
				if (this.clock){
					day.mDate.hours(date.hours());
					day.mDate.minutes(date.minutes());
					//set clock hands
					this.isHoveredHour = this.isSelectedHour = day.mDate.hours();
					this.isHoveredMinute = Math.ceil(day.mDate.minutes()/5)*5;
					this.isSelectedMinute = day.mDate.minutes();
				}
				this.selectDate(day);
				break;
				}
			}
		};
	}

	isToday(date: moment.Moment): boolean {
	  return moment().isSame(moment(date), 'day');
	}
  
	isSelected(date: moment.Moment): boolean {
		if (this.currentSelection){
			return date.isSame(this.currentSelection.mDate,'day');
		}
		return false;
	}
  
	isSelectedMonth(date: moment.Moment): boolean {
	  return moment(date).isSame(this.currentDate, 'month');
	}
  
	selectDate(date: CalendarDate, clicked = false): void {
		if (this.currentSelection){  
			this.currentSelection.selected = false;
		}
		
		if (this.clock){
			if (this.isSelectedHour){
				date.mDate.hours(this.isSelectedHour);				
			}
			if (this.isSelectedMinute){
				date.mDate.minute(this.isSelectedMinute);
			}
		}
		this.currentSelection = date;
		this.currentSelection.selected = true;
		if (clicked){
			console.log(this.currentSelection.mDate.hours());
			console.log(this.currentSelection.mDate.minutes());
			this.onSelectDate.emit(this.currentSelection.mDate);
			this.onExpand();	
		}
	}

	selectYear(selection: string){
		switch(selection){
			case 'JAN': this.currentDate.month(0); break;
			case 'FEB': this.currentDate.month(1); break;
			case 'MAR': this.currentDate.month(2); break;
			case 'APR': this.currentDate.month(3); break;
			case 'MAY': this.currentDate.month(4); break;
			case 'JUN': this.currentDate.month(5); break;
			case 'JUL': this.currentDate.month(6); break;
			case 'AUG': this.currentDate.month(7); break;
			case 'SEP': this.currentDate.month(8); break;
			case 'OCT': this.currentDate.month(9); break;
			case 'NOV': this.currentDate.month(10); break;
			case 'DEC': this.currentDate.month(11); break;
			default: this.currentDate.month(); break;
		}
		this.inYearSelection = false;
		this.generateCalendar();
	}
  
	prev(){
		if (this.inYearSelection){
			this.prevYear();
		}
		else{
			this.prevMonth();
		}
	}
	next(){
		if (this.inYearSelection){
			this.nextYear();
		}
		else{
			this.nextMonth();
		}
	}
	prevMonth(): void {
	  this.currentDate = moment(this.currentDate).subtract(1, 'months');
	  this.generateCalendar();
	}
  
	nextMonth(): void {
	  this.currentDate = moment(this.currentDate).add(1, 'months');
	  this.generateCalendar();
	}
  
	firstMonth(): void {
	  this.currentDate = moment(this.currentDate).startOf('year');
	  this.generateCalendar();
	}
  
	lastMonth(): void {
	  this.currentDate = moment(this.currentDate).endOf('year');
	  this.generateCalendar();
	}
  
	prevYear(): void {
	  this.currentDate = moment(this.currentDate).subtract(1, 'year');
	  this.generateCalendar();
	}
  
	nextYear(): void {
	  this.currentDate = moment(this.currentDate).add(1, 'year');
	  this.generateCalendar();
	}
  
	generateCalendar(): void {
	  this.months[0][0] = this.currentDate.format('YYYY');//decorator
	  const dates = this.fillDates(this.currentDate);
	  const weeks: CalendarDate[][] = [];
	  while (dates.length > 0) {
		weeks.push(dates.splice(0, 7));
	  }
	  this.weeks = weeks;
	}
  
	fillDates(currentMoment: moment.Moment): CalendarDate[] {
	  const firstOfMonth = moment(currentMoment).startOf('month').day();
	  const firstDayOfGrid = moment(currentMoment).startOf('month').subtract(firstOfMonth, 'days');
	  const start = firstDayOfGrid.date();
	//   return _.range(start, start + 42) 
	 return Array.from(Array(42), (_, i) => start + i)
		.map((date: number): CalendarDate => {
		const d = moment(firstDayOfGrid).date(date);
		const t = {
			today: this.isToday(d),
			selected: this.isSelected(d),
			mDate: d,
		};
		if (t.selected){
			this.currentSelection = t;
		}
		return t;
		});
	}

	yearSelection(yearSelection: boolean){
		this.inYearSelection = yearSelection;
		this.inClockSelection = this.inMinutesSelection = this.inHoursSelection = false;
	}
	timeSelection(hourSelection: boolean){
		if (!this.inClockSelection){
			this.inClockSelection = true;
		 	this.clockHandLength = 35;	
			this.clockHandTopPosition = "calc(15% - 0.5px)";
		}
		this.inHoursSelection = hourSelection;
		this.inMinutesSelection = !hourSelection;
		this.setClockHandLength(this.inHoursSelection);
		if (this.inMinutesSelection){
			this.onClockMinutes(this.isHoveredMinute);
		}
		else{
			this.onClockHours(this.isHoveredHour);
		}
	}

	clockHandPosition = 0;
	clockHandLength = 35;
	clockHandTopPosition: string = "calc(15% - 0.5px)"
	onClockMinutes(minute: number){
		this.isHoveredMinute = minute;
		switch (minute){
			case 0: this.clockHandPosition = 0; break;
			case 5: this.clockHandPosition = 30; break;
			case 10: this.clockHandPosition = 60; break;
			case 15: this.clockHandPosition = 90; break;
			case 20: this.clockHandPosition = 122.5; break;
			case 25: this.clockHandPosition = 150; break;
			case 30: this.clockHandPosition = 180; break;
			case 35: this.clockHandPosition = -150; break;
			case 40: this.clockHandPosition = -122.5; break;
			case 45: this.clockHandPosition = -90; break;
			case 50: this.clockHandPosition = -60; break;
			case 55: this.clockHandPosition = -30; break;
			default: this.clockHandPosition = 0; break;
		}
	}

	onMinuteClicked(minute: number){
		this.isSelectedMinute = minute;
		this.currentSelection.mDate.minutes(minute);
		this.onSelectDate.emit(this.currentSelection.mDate);
		this.onExpand();
	}
	
	onClockHours(hour: number){
		this.isHoveredHour = hour;
		switch (hour){
			case 0: case 12:
			this.clockHandPosition = 0; break;
			case 1: case 13:
			this.clockHandPosition = 30; break;
			case 2: case 14:
			this.clockHandPosition = 60; break;
			case 3: case 15:
			this.clockHandPosition = 90; break;
			case 4: case 16:
			this.clockHandPosition = 122.5; break;
			case 5: case 17:
			this.clockHandPosition = 150; break;
			case 6: case 18:
			this.clockHandPosition = 180; break;
			case 7: case 19:
			this.clockHandPosition = -150; break;
			case 8: case 20:
			this.clockHandPosition = -122.5; break;
			case 9: case 21:
			this.clockHandPosition = -90; break;
			case 10: case 22:
			this.clockHandPosition = -60; break;
			case 11: case 23:
			this.clockHandPosition = -30; break;
			default: this.clockHandPosition = 0; break;
		}		
		const shortHand = hour > 12 || hour < 1 ? true : false;
		this.setClockHandLength(shortHand);
	}

	onHourClicked(hour: number){
		this.isSelectedHour = hour;
		this.currentSelection.mDate.hour(hour);
		this.onSelectDate.emit(this.currentSelection.mDate);
		this.onExpand();	
	}

	setClockHandLength(shortHand: boolean){
		if (!shortHand){
			this.clockHandLength = 35;	
			this.clockHandTopPosition = "calc(15% - 0.5px)";
		}
		else{
			this.clockHandLength = 25;
			this.clockHandTopPosition = "25%";
		}
	}

  }
