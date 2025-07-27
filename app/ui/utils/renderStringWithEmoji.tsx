import createEmojiRegex from "emoji-regex";
import type {ReactNode} from "react";
import React, {Fragment} from "react";
import {Text} from "react-native";
import {StyleSheet} from "react-native-unistyles";

const emojiRegex = createEmojiRegex();

export function renderStringWithEmoji(stringNode: ReactNode) {
	const strings = Array.isArray(stringNode) ? stringNode : [stringNode];
	return (
		<Fragment>
			{strings.map((string) => {
				if (typeof string !== "string") {
					return string;
				}

				const emojis = string.match(emojiRegex);
				if (emojis === null) return string;

				return string.split(emojiRegex).map((stringPart, index) => (
					<Fragment key={`emoji-${index}`}>
						{stringPart}
						{emojis[index] ? (
							<Text style={styles.emoji}>{emojis[index]}</Text>
						) : null}
					</Fragment>
				));
			})}
		</Fragment>
	);
}

const styles = StyleSheet.create(({colors}) => ({
	emoji: {
		color: colors.black,
		fontFamily: "System",
	},
}));
