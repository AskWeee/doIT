import React from 'react'

const Two = (props: IProps) => {
    return (
        <div>Hello Two {props.userName}</div>
    )
}

interface IProps {
    userName: string
}

export default Two