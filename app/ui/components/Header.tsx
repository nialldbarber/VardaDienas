import {useTranslation} from "react-i18next";
import {StyleSheet} from "react-native-unistyles";

import {Text} from "@/app/ui/components/Text";
import {View} from "@/app/ui/components/View";
import {getCurrentDateHeader} from "@/app/utils/dateFormat";

type HeaderProps = {
	title: string;
	showDate?: boolean;
};

export function Header({title, showDate = false}: HeaderProps) {
	const {t} = useTranslation();

	const currentDate = showDate ? getCurrentDateHeader(t) : null;

	return (
		<View style={styles.header}>
			<Text variant="header">{title}</Text>
			{showDate && currentDate && (
				<Text style={styles.dateText} withEmoji>
					{`${currentDate}   🗓️`}
				</Text>
			)}
		</View>
	);
}

const styles = StyleSheet.create(({sizes, colors}) => ({
	header: {
		paddingHorizontal: sizes["10px"],
		height: 50,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	dateText: {
		fontSize: 14,
		color: colors.white,
		marginLeft: sizes["15px"],
		fontWeight: "900",
	},
}));
