import type {BottomSheetModal} from "@gorhom/bottom-sheet";
import {useNavigation} from "@react-navigation/native";
import {FlashList} from "@shopify/flash-list";
import React from "react";
import {Pressable, useWindowDimensions} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {StyleSheet} from "react-native-unistyles";

import {vardūs} from "@/app/constants/vardūs.json";
import {FastScrollIndex} from "@/app/modules/Home/components/FastScrollIndex";
import {Search} from "@/app/modules/Home/components/Search";
import {SearchBottomSheet} from "@/app/modules/Home/components/SearchBottomSheet";
import type {NamesRowScreenNavigationProp} from "@/app/navigation/navigation";
import type {DayData} from "@/app/types";
import {Text} from "@/app/ui/components/Text";
import {View} from "@/app/ui/components/View";
import {getTodaysIndex} from "@/app/utils/dates";

type VardusItem = DayData;

type SearchResult = {
	day: DayData;
	month: string;
	matchType: "vardi" | "citiVardi";
	matchedName: string;
};

export function HomeScreen() {
	const bottomSheetRef = React.useRef<BottomSheetModal>(null);
	const flashListRef = React.useRef<FlashList<string | VardusItem>>(null);
	const [currentMonth, setCurrentMonth] = React.useState<string | null>(null);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
	const {navigate} = useNavigation<NamesRowScreenNavigationProp>();
	const {height} = useWindowDimensions();
	const insets = useSafeAreaInsets();

	const handleOpenSearch = React.useCallback(() => {
		bottomSheetRef.current?.present();
		console.log("i am expanding ");
	}, []);

	const handleSearchQueryChange = React.useCallback((query: string) => {
		setSearchQuery(query);
	}, []);

	React.useEffect(() => {
		if (!searchQuery.trim() || searchQuery.trim().length < 2) {
			setSearchResults([]);
			return;
		}

		const timeoutId = setTimeout(() => {
			const lowercaseQuery = searchQuery.toLowerCase().trim();
			const results: SearchResult[] = [];
			let currentMonthName = "";

			for (const item of vardūs) {
				if (typeof item === "string") {
					currentMonthName = item;
					continue;
				}

				for (const name of item.vardi) {
					if (name.toLowerCase().includes(lowercaseQuery)) {
						results.push({
							day: item,
							month: currentMonthName,
							matchType: "vardi",
							matchedName: name,
						});
					}
				}

				for (const name of item.citiVardi) {
					if (name.toLowerCase().includes(lowercaseQuery)) {
						results.push({
							day: item,
							month: currentMonthName,
							matchType: "citiVardi",
							matchedName: name,
						});
					}
				}

				if (results.length >= 40) break;
			}

			results.sort((a, b) => {
				const aExact = a.matchedName.toLowerCase() === lowercaseQuery;
				const bExact = b.matchedName.toLowerCase() === lowercaseQuery;

				if (aExact && !bExact) return -1;
				if (!aExact && bExact) return 1;

				if (a.matchType === "vardi" && b.matchType === "citiVardi") return -1;
				if (a.matchType === "citiVardi" && b.matchType === "vardi") return 1;

				return 0;
			});

			setSearchResults(results.slice(0, 20));
		}, 300);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [searchQuery]);

	const handleSearchResultPress = React.useCallback(
		(result: SearchResult) => {
			bottomSheetRef.current?.dismiss();
			navigate("NamesRow", {data: result.day, month: result.month});
		},
		[navigate],
	);

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

	const months = React.useMemo(() => {
		return monthIndexMap.map((item) => item.name);
	}, [monthIndexMap]);

	const handleMonthSelect = React.useCallback(
		(monthIndex: number) => {
			const monthInfo = monthIndexMap[monthIndex];
			if (monthInfo && flashListRef.current) {
				flashListRef.current.scrollToIndex({
					index: monthInfo.index,
					animated: true,
				});
			}
		},
		[monthIndexMap],
	);

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

	const renderItem = React.useCallback(
		({item}: {item: string | VardusItem}) => {
			if (typeof item === "string") return null;
			return (
				<Pressable
					onPress={() =>
						navigate("NamesRow", {data: item, month: currentMonth})
					}
					style={{paddingBottom: 10}}
				>
					<Text variant="header" style={styles.headerText}>
						{item.diena}
					</Text>
					<View>
						<Text style={styles.vardi}>{item.vardi.join(" ")}</Text>
						<Text style={styles.citiVardi}>{item.citiVardi.join(" ")}</Text>
					</View>
				</Pressable>
			);
		},
		[navigate, currentMonth],
	);

	const listContainerHeight = height - insets.top - 120;

	return (
		<View style={styles.container}>
			<View style={styles.headerContainer}>
				<Search currentMonth={currentMonth} openSearch={handleOpenSearch} />
			</View>
			<View style={styles.contentContainer}>
				<SearchBottomSheet
					ref={bottomSheetRef}
					searchQuery={searchQuery}
					onSearchQueryChange={handleSearchQueryChange}
					searchResults={searchResults}
					onResultPress={handleSearchResultPress}
				/>
				<View style={styles.listContainer}>
					<FlashList
						ref={flashListRef}
						data={vardūs}
						contentContainerStyle={styles.flashListContent}
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
					<FastScrollIndex
						months={months}
						onMonthSelect={handleMonthSelect}
						containerHeight={listContainerHeight}
					/>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create(({colors, sizes, tokens}, rtl) => ({
	container: {
		flex: 1,
		paddingTop: rtl.insets.top,
		backgroundColor: colors.primary,
	},
	headerContainer: {
		zIndex: 100,
		elevation: 2,
	},
	contentContainer: {
		flex: 1,
	},
	listContainer: {
		flex: 1,
		position: "relative",
	},
	flashListContent: {
		paddingHorizontal: 10,
		paddingRight: 45,
		backgroundColor: tokens.background.primary,
	},
	diena: {
		fontSize: 30,
		fontWeight: "800",
		fontFamily: "Plus Jakarta Sans",
	},
	vardi: {
		fontSize: 18,
		color: colors.primary,
		marginTop: sizes["5px"],
		fontWeight: "700",
		fontFamily: "Plus Jakarta Sans",
	},
	citiVardi: {
		fontSize: 14,
		color: tokens.text.header,
		marginTop: sizes["3px"],
		lineHeight: 20,
	},
	headerText: {
		color: tokens.text.header,
	},
}));
