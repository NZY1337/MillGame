import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react'
import './App.css'
import Game from './Game';

function App() {
    const { user } = useUser();

    console.log(user?.id);

    return (
        <>
            <header>
                <SignedOut>
                    <SignInButton />
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </header>
        
        <Game />
        </>
    )
}

export default App
