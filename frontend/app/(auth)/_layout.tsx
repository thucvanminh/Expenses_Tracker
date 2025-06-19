import { Redirect, Stack } from 'expo-router'
import { useUser } from '@clerk/clerk-expo'

export default function AuthRoutesLayout() {
    const { isSignedIn } = useUser()

    if (isSignedIn) {
        return <Redirect href={"/"} />
    }

    return <Stack screenOptions={{ headerShown: false }} />
}