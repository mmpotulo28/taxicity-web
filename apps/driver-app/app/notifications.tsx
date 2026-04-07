import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useDriverNotifications } from "../src/hooks/useDriverNotifications";

export default function DriverNotificationsScreen() {
	const { isLoading, isConnected, notifications, error, unreadCount, refreshNotifications, markSingleNotificationAsRead, markAllNotificationsAsRead } = useDriverNotifications();

	return (
		<ScrollView className='flex-1 bg-zinc-100' contentContainerClassName='p-4 pb-10 gap-3'>
			<View className='flex-row items-center justify-between'>
				<Text className='text-2xl font-bold text-zinc-900'>Notifications</Text>
				<View className='px-2 py-1 rounded-full bg-amber-100'>
					<Text className='text-[11px] font-semibold text-amber-700'>Unread: {unreadCount}</Text>
				</View>
			</View>

			<View className='flex-row items-center justify-between'>
				<Text className='text-zinc-500 text-sm'>Realtime: {isConnected ? "connected" : "offline"}</Text>
				<Pressable onPress={() => void refreshNotifications()} className='rounded-lg border border-zinc-300 px-3 py-1'>
					<Text className='text-zinc-700 text-xs font-semibold'>Refresh</Text>
				</Pressable>
			</View>

			{isLoading ? (
				<View className='rounded-2xl bg-white border border-zinc-200 p-5 items-center gap-2'>
					<ActivityIndicator size='small' color='#f59e0b' />
					<Text className='text-zinc-500'>Loading notifications...</Text>
				</View>
			) : null}

			{error ? (
				<View className='rounded-2xl bg-red-50 border border-red-200 p-4'>
					<Text className='text-red-700 text-sm'>{error}</Text>
				</View>
			) : null}

			{!isLoading && notifications.length === 0 ? (
				<View className='rounded-2xl bg-white border border-zinc-200 p-4'>
					<Text className='text-zinc-500'>No notifications yet.</Text>
				</View>
			) : null}

			{notifications.map((notification) => (
				<View key={notification.id} className={`rounded-2xl bg-white border p-4 ${notification.read ? "border-zinc-200" : "border-amber-300"}`}>
					<View className='flex-row items-start justify-between gap-3'>
						<View className='flex-1'>
							<Text className='text-zinc-900 font-semibold'>{notification.title}</Text>
							<Text className='text-zinc-600 text-sm mt-1'>{notification.message}</Text>
							<Text className='text-zinc-400 text-xs mt-2'>{new Date(notification.createdAt).toLocaleString()}</Text>
						</View>
						{notification.read ? null : (
							<Pressable onPress={() => void markSingleNotificationAsRead(notification.id)} className='rounded-lg border border-zinc-300 px-2 py-1'>
								<Text className='text-zinc-700 text-xs font-semibold'>Mark read</Text>
							</Pressable>
						)}
					</View>
				</View>
			))}

			{notifications.length > 0 ? (
				<Pressable onPress={() => void markAllNotificationsAsRead()} className='rounded-xl border border-zinc-300 py-3 items-center'>
					<Text className='text-zinc-700 font-semibold'>Mark all as read</Text>
				</Pressable>
			) : null}
		</ScrollView>
	);
}
