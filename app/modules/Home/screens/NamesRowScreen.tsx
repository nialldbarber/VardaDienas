import {use$} from "@legendapp/state/react";
import {type StaticScreenProps, useNavigation} from "@react-navigation/native";
import {ArrowLeft} from "iconsax-react-native";
import {Pressable, View} from "react-native";
import {StyleSheet} from "react-native-unistyles";

import {CheckboxRow} from "@/app/modules/Home/components/CheckboxRow";
import {favourites$} from "@/app/store/favourites";
import type {DayData} from "@/app/types";
import {Text} from "@/app/ui/components/Text";
import {Layout} from "@/app/ui/components/layout";
import {colors} from "@/app/ui/config/colors";

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
	const favourites = use$(favourites$.favourites.get());

	return (
		<Layout
			withScroll="vertical"
			header={
				<View style={styles.headerRow}>
					<Pressable onPress={() => goBack()}>
						<ArrowLeft size="25" color={colors.white} variant="Outline" />
					</Pressable>
					<Text style={styles.header("dark")}>
						{data.diena} {month}
					</Text>
				</View>
			}
		>
			<View style={{padding: 10}}>
				<View>
					<Text style={styles.header("light")}>Vārdi</Text>
					<View>
						{data.vardi.map((vards, index) => {
							const isChecked = favourites.some((fav) => fav.name === vards);
							return (
								<CheckboxRow
									key={`vardi-${vards}`}
									vards={vards}
									isChecked={isChecked}
									data={data}
									month={month}
								/>
							);
						})}
					</View>
				</View>
				<View style={{height: 20}} />
				<View>
					<Text style={styles.header("light")}>Citi vārdi</Text>
					<View>
						{data.citiVardi.map((vards, index) => {
							const isChecked = favourites.some((fav) => fav.name === vards);
							return (
								<CheckboxRow
									key={`citi-vardi-${vards}`}
									vards={vards}
									isChecked={isChecked}
									data={data}
									month={month}
								/>
							);
						})}
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
		paddingHorizontal: sizes["10px"],
		height: 50,
	},
	header: (variant: "dark" | "light") => ({
		fontSize: 25,
		fontWeight: "600",
		color: variant === "dark" ? colors.white : colors.black,
	}),
}));
