import Toast from "react-native-toast-message";
import {StyleSheet} from "react-native-unistyles";

import {favourites$} from "@/app/store/favourites";
import type {DayData} from "@/app/types";
import {Checkbox} from "@/app/ui/components/Checkbox";
import {Text} from "@/app/ui/components/Text";
import {View} from "@/app/ui/components/View";

type Props = {
	vards: string;
	isChecked: boolean;
	data: DayData;
	month: string | null;
	isLast: boolean;
};

export function CheckboxRow({vards, isChecked, data, month, isLast}: Props) {
	const handleCheckedChange = () => {
		favourites$.addFavourite({
			name: vards,
			day: data.diena,
			month: month ?? "",
		});
		Toast.show({
			type: "success",
			text1: `${vards} pievienots`,
			position: "bottom",
		});
	};

	const handleUnCheckedChange = () => {
		favourites$.removeFavourite(vards);
		Toast.show({
			type: "info",
			text1: `${vards} izņemts`,
			position: "bottom",
		});
	};

	return (
		<View style={styles.container(isLast)}>
			<Text style={styles.text}>{vards}</Text>
			<View>
				<Checkbox
					checked={isChecked}
					onCheckedChange={handleCheckedChange}
					onUnCheckedChange={handleUnCheckedChange}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create(({sizes, colors, tokens}) => ({
	container: (isLast: boolean) => ({
		paddingTop: sizes["10px"],
		paddingBottom: sizes["10px"],
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
		flex: 1,
		borderBottomColor: isLast ? "transparent" : colors.grey3,
		borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
	}),
	text: {
		color: tokens.text.primary,
	},
}));
