export type DayData = {
	diena: string;
	vardi: string[];
	citiVardi: string[];
};

export type MonthData = string | DayData;

export type VardasData = {
	vardūs: MonthData[];
};
