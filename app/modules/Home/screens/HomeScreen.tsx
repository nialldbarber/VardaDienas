import type {BottomSheetModal} from "@gorhom/bottom-sheet";
import {useNavigation} from "@react-navigation/native";
import {FlashList} from "@shopify/flash-list";
import React from "react";
import {Pressable, Text, View} from "react-native";
import {StyleSheet} from "react-native-unistyles";

import {vardūs} from "@/app/constants/vardūs.json";
import {Search} from "@/app/modules/Home/components/Search";
import {SearchBottomSheet} from "@/app/modules/Home/components/SearchBottomSheet";
import type {NamesRowScreenNavigationProp} from "@/app/navigation/navigation";
import {Layout} from "@/app/ui/components/layout";
import {getTodaysIndex} from "@/app/utils/dates";

export function HomeScreen() {
	const bottomSheetRef = React.useRef<BottomSheetModal>(null);
	const [currentMonth, setCurrentMonth] = React.useState<string | null>(null);
	const {navigate} = useNavigation<NamesRowScreenNavigationProp>();

	const handleOpenSearch = React.useCallback(() => {
		bottomSheetRef.current?.present();
		console.log("i am expanding ");
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const monthIndexMap = React.useMemo(() => {
		return vardūs.reduce<{index: number; name: string}[]>(
			(acc, item, index) => {
				if (typeof item === "string") {
					acc.push({index, name: item});
				}
				return acc;
			},
			[],
		);
	}, [vardūs]);

	const onViewableItemsChanged = React.useCallback(
		({viewableItems}: {viewableItems: Array<{index: number | null}>}) => {
			if (viewableItems.length === 0) return;

			const firstVisibleIndex = viewableItems[0].index;
			if (firstVisibleIndex === null) return;

			for (let i = monthIndexMap.length - 1; i >= 0; i--) {
				if (monthIndexMap[i].index <= firstVisibleIndex) {
					setCurrentMonth(monthIndexMap[i].name);
					break;
				}
			}
		},
		[monthIndexMap],
	);

	type VardusItem = {diena: string; vardi: string[]; citiVardi: string[]};
	const renderItem = React.useCallback(
		({item}: {item: string | VardusItem}) => {
			if (typeof item === "string") return null;
			return (
				<Pressable
					onPress={() =>
						navigate("NamesRow", {data: item, month: currentMonth})
					}
				>
					<Text style={styles.diena}>{item.diena}</Text>
					<View>
						<Text style={styles.vardi}>{item.vardi.join(" ")}</Text>
						<Text style={styles.citiVardi}>{item.citiVardi.join(" ")}</Text>
					</View>
				</Pressable>
			);
		},
		[navigate, currentMonth],
	);

	return (
		<Layout>
			<Search currentMonth={currentMonth} openSearch={handleOpenSearch} />
			<View style={{flexDirection: "row"}}>
				<SearchBottomSheet ref={bottomSheetRef} />
				<FlashList
					data={vardūs}
					contentContainerStyle={{paddingHorizontal: 10}}
					renderItem={renderItem}
					keyExtractor={(item, index) => {
						if (typeof item === "string") {
							return `month-${item}`;
						}
						let month = "unknown";
						for (let i = index; i >= 0; i--) {
							const prev = vardūs[i];
							if (typeof prev === "string") {
								month = prev;
								break;
							}
						}

						return `day-${month}-${item.diena}`;
					}}
					showsVerticalScrollIndicator={false}
					estimatedItemSize={70}
					initialScrollIndex={getTodaysIndex(vardūs)}
					onViewableItemsChanged={onViewableItemsChanged}
				/>
				<View>
					<Text>List</Text>
				</View>
			</View>
		</Layout>
	);
}

const styles = StyleSheet.create(({colors, sizes}) => ({
	diena: {
		fontSize: 30,
		fontWeight: "700",
	},
	vardi: {
		fontSize: 18,
		color: colors.primary,
		marginTop: sizes["5px"],
	},
	citiVardi: {
		fontSize: 14,
		color: colors.black,
		marginTop: sizes["3px"],
		lineHeight: 18,
	},
}));
