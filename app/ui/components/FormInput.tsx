import React from "react";
import {Input, type InputProps} from "./Input";

export interface FormInputProps
	extends Omit<InputProps, "error" | "onChangeText" | "value"> {
	field: {
		state: {
			value: string;
			meta: {
				errors?: string[];
			};
		};
		handleChange: (value: string) => void;
		handleBlur: () => void;
	};
}

export function FormInput({field, ...props}: FormInputProps) {
	return (
		<Input
			{...props}
			value={field.state.value || ""}
			onChangeText={field.handleChange}
			onBlur={field.handleBlur}
			error={field.state.meta.errors?.[0]}
			{...props}
		/>
	);
}
