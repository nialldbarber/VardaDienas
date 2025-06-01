import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetTextInput,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import type {BottomSheetModalMethods} from "@gorhom/bottom-sheet/lib/typescript/types";
import React from "react";
import {Text} from "react-native";
import {StyleSheet} from "react-native-unistyles";

export const SearchBottomSheet = React.forwardRef<
	BottomSheetModalMethods,
	Record<string, never>
>((_, ref) => {
	const snapPoints = React.useMemo(() => ["25%"], []);

	const handleSheetChanges = React.useCallback((index: number) => {
		console.log("handleSheetChanges", index);
	}, []);

	return (
		<BottomSheetModal
			ref={ref}
			index={1}
			snapPoints={snapPoints}
			bottomInset={50}
			detached
			backdropComponent={BottomSheetBackdrop}
			style={styles.sheetContainer}
			onChange={handleSheetChanges}
		>
			<BottomSheetView style={styles.contentContainer}>
				<Text>Awesome 🎉</Text>
				<BottomSheetTextInput style={{backgroundColor: "red", width: "100%"}} />
			</BottomSheetView>
		</BottomSheetModal>
	);
});

const styles = StyleSheet.create(() => ({
	container: {
		flex: 1,
		padding: 24,
		backgroundColor: "grey",
	},
	sheetContainer: {
		marginHorizontal: 24,
		zIndex: 1000,
	},
	contentContainer: {
		flex: 1,
		alignItems: "center",
	},
}));
