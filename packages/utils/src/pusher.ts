import Pusher from "pusher";

// Ensure existing instance prevents multiple connections in dev (though Pusher is HTTP based, so less issue than DB)
const globalForPusher = globalThis as unknown as { pusher: Pusher };

export const pusherServer =
	globalForPusher.pusher ||
	new Pusher({
		appId: process.env.PUSHER_APP_ID || "",
		key: process.env.PUSHER_KEY || "",
		secret: process.env.PUSHER_SECRET || "",
		cluster: process.env.PUSHER_CLUSTER || "mt1",
		useTLS: true,
	});

if (process.env.NODE_ENV !== "production") globalForPusher.pusher = pusherServer;
