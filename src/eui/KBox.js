import React, { useState, useEffect } from 'react'
import './KBox.scss'

function KBox() {
    const [count, setCount] = useState(0)

    // componentDidMount, componentDidUpdate 两个生命周期函数类似
    useEffect(() => {
        console.log('做点什么事儿', count)
    }, [count])

    return (
        <div className="euiKBox">
            TEST
        </div>
    )
}

export default KBox