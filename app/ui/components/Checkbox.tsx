import React from "react";
import BouncyCheckbox from "react-native-bouncy-checkbox";

import {haptics$} from "@/app/store/haptics";
import {colors} from "@/app/ui/config/colors";
import {hapticToTrigger} from "@/app/utils/haptics";
import {use$} from "@legendapp/state/react";

type Props = {
	checked?: boolean;
	onCheckedChange?: () => void;
	onUnCheckedChange?: () => void;
};

export function Checkbox({
	checked = false,
	onCheckedChange,
	onUnCheckedChange,
}: Props) {
	const [localChecked, setLocalChecked] = React.useState(checked);
	const haptic = hapticToTrigger("impactMedium");
	const hapticsEnabled = use$(haptics$.enabled);

	React.useEffect(() => {
		setLocalChecked(checked);
	}, [checked]);

	const handleChange = () => {
		const newChecked = !localChecked;
		setLocalChecked(newChecked);

		if (newChecked) {
			onCheckedChange?.();
		} else {
			onUnCheckedChange?.();
		}

		haptic.impactMedium();
	};

	return (
		<BouncyCheckbox
			style={{
				alignSelf: "center",
				justifyContent: "flex-start",
				width: 25,
			}}
			fillColor={colors.primary}
			isChecked={localChecked}
			onPress={handleChange}
			onLongPress={handleChange}
		/>
	);
}
