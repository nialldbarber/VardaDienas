import {type StaticScreenProps, useNavigation} from "@react-navigation/native";
import {Pressable, Text, View} from "react-native";

import {favourites$} from "@/app/store/favourites";
import type {DayData} from "@/app/types";
import {Layout} from "@/app/ui/components/layout";
import {colors} from "@/app/ui/config/colors";
import {use$} from "@legendapp/state/react";
import {ArrowLeft} from "iconsax-react-native";
import {StyleSheet} from "react-native-unistyles";

type Props = StaticScreenProps<{
	data: DayData;
	month: string | null;
}>;

export function NamesRowScreen({
	route: {
		params: {data, month},
	},
}: Props) {
	const {goBack} = useNavigation();

	const favourites = use$(favourites$);

	return (
		<Layout withScroll="vertical">
			<View style={styles.headerRow}>
				<Pressable onPress={() => goBack()}>
					<ArrowLeft size="35" color={colors.white} variant="Outline" />
				</Pressable>
				<Text style={styles.header}>
					{data.diena} {month}
				</Text>
			</View>
			<View>
				<View>
					<Text>Vārdi</Text>
					<View>
						{data.vardi.map((vards, index) => (
							<Text key={`vardi-${index}`} style={{fontSize: 18}}>
								{vards}
							</Text>
						))}
					</View>
				</View>
				<View>
					<Text>Citi vārdi</Text>
					<View>
						{data.citiVardi.map((vards, index) => (
							<Text key={`citi-vardi-${index}`} style={{fontSize: 18}}>
								{vards}
							</Text>
						))}
					</View>
				</View>
			</View>
		</Layout>
	);
}

const styles = StyleSheet.create(({colors, sizes}) => ({
	headerRow: {
		backgroundColor: colors.primary,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: sizes["12px"],
	},
	header: {
		fontSize: 25,
		fontWeight: "600",
		color: colors.white,
	},
}));
