import { useEffect, useState, useRef } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import useSignalR from './useSignalR';
import axios from 'axios';

function App() {
  const { connection } = useSignalR("/r/chat");
  const [rooms, setRooms] = useState([]);
  let [letterIndex, setLetterIndex] = useState(0);
  let [progress, setProgress] = useState(0);
  let [typing, setTyping] = useState("");
  const [userIstSet, setUserIsSet] = useState(false);
  const [user, setUser] = useState("");
  const [username, setUsername] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [nameExists, setNameExists] = useState(false);
  const [enterGame, setEnterGame] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [editingRoom, setEditingRoom] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);
  const [winner, setWinner] = useState("");
  const [randomNum, setRandomNum] = useState(0);

  // maybe use chatgpt to generate phrases
  let tempPhrases = [
    "The dog, often referred to as man's best friend, is a remarkable creature that fills our lives with joy, companionship, and unwavering loyalty. With its wagging tail, eager eyes, and playful demeanor, the dog is a furry bundle of unconditional love that brings warmth and happiness to our hearts. Whether bounding happily towards us after a long day, curling up at our feet with a contented sigh, or providing a comforting presence during difficult times, the dog's unwavering devotion is a testament to the special bond between humans and animals.",
    "Beyond their affectionate nature, dogs also serve as protectors, guards, and working companions. They are tirelessly loyal and vigilant, watching over our homes, keeping us safe, and even assisting us in various tasks. From guiding the blind to detecting bombs, drugs, or missing persons, dogs possess remarkable senses and intelligence that make them invaluable partners in many aspects of our lives.",
    "Furthermore, the dog's innate ability to empathize and provide comfort is awe-inspiring. They have an uncanny sense of knowing when we are sad, stressed, or in need of emotional support, and they respond with unwavering compassion. Their gentle presence and unconditional love can lift our spirits, offer solace during challenging times, and bring a sense of peace and healing to our souls.",
    "Cool dogs are a breed unto themselves, with their effortless charisma, boundless enthusiasm, and unmistakable swagger that set them apart from the rest. They come in all shapes and sizes, from the sleek and suave to the quirky and unconventional, each with their own distinct personality that captures our hearts and leaves us in awe. With their confident strides, wagging tails, and playful antics, cool dogs exude a sense of self-assuredness and nonconformity that we can't help but admire.",
    "These four-legged trendsetters have a natural flair for style, effortlessly rocking the latest doggy fashion or sporting a unique look that turns heads and elicits compliments. Whether it's strutting down the street in a pair of doggles, rocking a fashionable bandana, or flaunting their natural coat patterns with pride, cool dogs know how to make a statement and express their individuality with panache.",
    "But it's not just their physical appearance that makes cool dogs stand out; it's also their charismatic personalities that make them the life of the party. They have an uncanny ability to captivate us with their playful energy, their mischievous antics, and their infectious joie de vivre. Cool dogs are often the center of attention, effortlessly commanding the spotlight with their charm, wit, and irresistible charm.",
    "Moreover, cool dogs are trailblazers, unafraid to forge their own path and break free from the norm. They embody a spirit of nonconformity, fearlessly expressing themselves and embracing their uniqueness without concern for fitting in. Their independent nature, free-spiritedness, and refusal to conform to societal expectations inspire us to be true to ourselves, celebrate our individuality, and embrace our quirks and differences."
  ]

  let phrase = tempPhrases[Math.floor(randomNum * tempPhrases.length)];

  let phraseSplit = phrase.split("");

  let phraseLength = phrase.length;

  useEffect(() => {
    const getAllRooms = async () => {
      const res = await axios.get("/api/Rooms").then(res => {
        const limitThreePlayers = res.data.filter(room => room.users.length < 3)
        setRooms(limitThreePlayers)
      })
      return res;
    }
    getAllRooms()
  }, [])

  useEffect(() => {
    console.log("current room", currentRoom)
    // get users in current room
    const getAllUsers = async () => {
      if (currentRoom) {
        const res = await axios.get(`api/Users`).then(res => {
          // console.log(res.data)
          const usersInRoom = res.data.filter(user => user.roomId == currentRoom.id)
          console.log("users in room", usersInRoom)
          setUsersInRoom(usersInRoom)
          // setCurrentRoom(currentRoom => ({ ...currentRoom, users: usersInRoom }))
        })
        return res;
      }
    }
    getAllUsers()
  }, [waiting])


  useEffect(() => {
    if (!connection) {
      return
    }

    connection.on("AddRoom", (Room) => {
      // console.log("add Room", Rooms, Room)
      setRooms(Rooms => [...Rooms, Room])
    })

    connection.on("EditRoom", async (Room) => {
      const id = Room.id
      if (Room.users.length < 3) {
        setRooms(Rooms => Rooms.map(c => c.id == id ? Room : c))
      } else {
        setRooms(Rooms => Rooms.filter(Room => Room.id !== id))
        setWaiting(false)
        setRandomNum(1 / Room.id)
        //countdown to start game?
      }
    })

    connection.on("DeleteRoom", (Room) => {
      // console.log("delete", Rooms)
      const id = Room.id
      setRooms(Rooms => Rooms.filter(Room => Room.id !== id))
      setCurrentRoom("")
    })

    connection.on("EditUser", async (user) => {
      console.log("user in edituser", user.roomId)
      await axios.get(`api/Users`).then(res => {
        const usersInRoom = res.data.filter(u => u.roomId == user.roomId)
        console.log("users in room", usersInRoom)
        let winner = usersInRoom.filter(u => u.progress >= 93)
        console.log("winner", winner)
        if (winner.length > 0) {
          winner[0].progress = 100
          setShowVictoryScreen(true)
          setWinner(winner[0].userName)
          setDisabled(true)
          axios.put(`api/Users/${winner[0].id}`, winner)
          usersInRoom.map(u => u.id == winner[0].id ? winner : u)
        }
        setUsersInRoom(usersInRoom)
      })
      // console.log("userProg", userProg)
    })


    return () => {
      connection.invoke("RemoveFromRoom", currentRoom.id)
      connection.invoke("RemoveFromGroup", currentRoom.id)

      connection.off("AddRoom")
      connection.off("EditRoom")
      connection.off("DeleteRoom")
      connection.off("EditUser")

    }
  }, [connection])

  const handleSubmit = async (event) => {
    event.preventDefault();
    // check if username exists
    await axios.post("/api/Users", { UserName: username }).then(res => {
      setUser(res.data)
      setNameExists(false)
      setUserIsSet(true);
    }).catch(err => {
      setNameExists(true)
    })
    // console.log(rooms)
  };

  const handleInputChange = (event) => {
    setUsername(event.target.value);
  };

  const handleAddRoom = async (input) => {
    if (!input) return;

    if (editingRoom) {
      selectedRoom.roomName = input
      await axios.put(`/api/Rooms/${selectedRoom.id}`, selectedRoom).then(res => {
        setEditingRoom(false)
        setRoomInput("")
        setNameExists(false)
      }).catch(err => {
        // setNameExists(true)
        console.log(err)
      })
    } else {
      // event.preventDefault();
      await axios.post("/api/Rooms", { roomName: input }).then(res => {
        // setCurrentRoom(roomInput)
        setRoomInput("")
        setNameExists(false)
      }).catch(err => {
        setNameExists(true)
        console.log("same name already exists")
      })
    }
  };


  // game logic
  useEffect(() => {
    if (typing == phrase) {
      console.log("you win")
      setProgress(100)
      console.log(progress)
    }
    console.log(progress)
  }, [typing])

  async function handleKeyUp(event) {
    event.preventDefault()
    // console.log("current room", currentRoom)
    if (event.key == phraseSplit[letterIndex]) {
      console.log("correct")
      setTyping(typing + event.key)
      setLetterIndex(letterIndex + 1)
      user.progress = Math.round(typing.length / phraseLength * 100)
      console.log("user", user)
      await axios.put(`api/Users/${user.id}`, user)
      // setUsersInRoom(usersInRoom => usersInRoom.map(u => u.id == user.id ? user : u))
      setProgress(Math.round(typing.length / phraseLength * 100))

    }
  }


  const handleDeleteRoom = async (room) => {
    await axios.delete(`api/Rooms/${room.id}`)
  }

  const handleRoomSelect = async (room) => {
    setCurrentRoom(room)
    user.roomId = room.id
    room.users.push(user)
    // console.log(room)

    await axios.put(`api/Users/${user.id}`, user).then(async res => {
      setEnterGame(true)
      setWaiting(true)
      // getAllUsers()
      await axios.put(`api/Rooms/${room.id}`, room)
    })

  }


  return (
    <div className="App">
      {!userIstSet ? (
        <div className="bg-gray-100 min-h-screen w-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Speed Typing Game
            </h2>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm text-left font-medium text-gray-700">
                    Please enter a username:
                  </label>
                  <div className="mt-1">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={handleInputChange}
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
                  >
                    Enter
                  </button>
                  {nameExists ? <div className="text-red-500">Name already exists</div> : null}

                </div>
              </form>
            </div>
          </div>
        </div>)
        :
        (<div className='bg-gray-100 flex flex-col justify-center items-center min-h-screen w-screen py-12 sm:px-6 lg:px-8'>
          <div className='mb-10'>
            <b>User: {username}</b>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <b>Current Room: {currentRoom.roomName}</b>
          </div>
          {!enterGame ? (
            <div className='w-1/2'>
              {nameExists ? <div className="text-red-500">Name already exists</div> : null}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleAddRoom(roomInput)
                }
                }

                className="flex"
              >
                <input
                  className="w-5/6 px-3 py-2 mb-4 border rounded shadow"
                  type="text"
                  placeholder="room name"
                  value={roomInput}
                  onChange={e => setRoomInput(e.target.value)}
                >
                </input>
                <button className="w-1/2 px-3 py-2 mb-4 ml-3 text-white bg-slate-500 rounded hover:bg-slate-400 focus:outline-none focus:bg-slate-400" type="submit">{editingRoom ? "Edit Room" : "Add Room"}</button>
              </form>
              <p>3 users in a room</p>


              {rooms.length > 0 ?
                rooms.map(room => {
                  return <div key={room.id} className='flex'
                  // onMouseEnter={() => setShowOptions(true)}
                  // onMouseLeave={() => setShowOptions(false)}
                  >
                    {room.users.length == 0 && (
                      <div className="flex ml-2">
                        <button
                          onClick={() => {
                            setRoomInput(room.roomName);
                            setSelectedRoom(room);
                            setEditingRoom(true);
                          }}
                          className="text-gray-500 hover:text-gray-800 mr-2 focus:outline-indigo-400"
                        >edit
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room)}
                          className="text-gray-500 hover:text-gray-800 focus:outline-indigo-400"
                        >X
                        </button>
                      </div>
                    )}
                    {/* <button className="text-gray-500 hover:text-gray-800 focus:outline-indigo-400"
                    onClick={() => handleEditRoom()}
                    >edit</button> */}
                    <div onClick={() => handleRoomSelect(room)}
                      className={`w-full flex justify-between py-2 px-4 mb-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${editingRoom ? "bg-indigo-400" : "bg-indigo-500"} hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400`}>
                      <p>{room.roomName}</p>
                      <p>{room.users.length} users waiting</p>
                    </div>
                    {/* <p className='ml-5'>{room.users.length} users waiting</p> */}
                  </div>
                })
                : <p>No rooms</p>
              }
            </div>
          ) :
            (waiting
              ?
              <div className="bg-gray-100 min-h-screen w-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <p>waiting for more people to join the room</p>
              </div>
              :
              <div className='w-5/6'>
                {showVictoryScreen &&
                  <div>
                    <p>Winner is {winner}</p>
                  </div>}
                <div className='flex justify-between mb-20'>
                  {usersInRoom.filter(u => u.id !== user.id).map(user => {
                    return <div key={user.id} className='flex flex-col items-center w-1/3'>
                      <div className='w-10 h-10 bg-gray-300 rounded-full'></div>
                      <p>{user.userName}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
                        <div className="bg-indigo-600 h-2.5 rounded-full dark:bg-indigo-500" style={{ width: `${user.progress}%` }}></div>
                      </div>
                    </div>
                  })}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
                  <div className="bg-indigo-600 h-2.5 rounded-full dark:bg-indigo-500" style={{ width: `${progress}%` }}></div>
                </div>
                <p className='mb-10 mt-10'>{phrase}</p>
                <textarea type="text" className='bg-gray-200 w-full h-48 outline-none p-5' onKeyUp={handleKeyUp} value={typing} disabled={disabled} ></textarea>
              </div>

            )
          }
        </div>
        )
      }

    </div >
  )
}

export default App
