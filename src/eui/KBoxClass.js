import React from 'react'
import './KBox.scss'
import {Stage, Layer, Rect, Shape} from 'react-konva';

export default class KBoxClass extends React.Component {

    gRef = {
        divRoot: React.createRef(),
    }


    constructor(props) {
        super(props);

        window.addEventListener('resize', (e) => this.onDivResized(e, this.gRef));

        //todo >>>>> state
        this.state = {
            divRootWidth: 0,
            divRootHeight: 0,
        }

        //todo >>>>> bind
        this.onDivResized = this.onDivResized.bind(this);
    }

    componentDidMount() {
        //document.getElementById("divRoot").addEventListener('resize', this.onDivResized);

        setTimeout(() => {
            if (this.gRef.divRoot.current !== null) {
                let w = parseInt(this.gRef.divRoot.current.offsetWidth);
                let h = parseInt(this.gRef.divRoot.current.offsetHeight);
                console.log(w, h);

                this.setState({
                    divRootWidth: w,
                    divRootHeight: h,
                });
            }
        }, 500);

        // if (window.ResizeObserver) {
        //     const input = this.gRef.divRoot.current,
        //         observer = new ResizeObserver(() => {
        //             let w = parseInt(this.gRef.divRoot.current.offsetWidth);
        //             let h = parseInt(this.gRef.divRoot.current.offsetHeight);
        //             this.setState({ divRootWidth: w, divRootHeight: h,});
        //             observer.disconnect();
        //         });
        //
        //     observer.observe(input);
        // }
        // else {
        //     this.setState({ canResize: false });
        // }
    }

    onDivResized(e, gRef) {
        console.log(gRef);
        if (gRef !== undefined) {
            if (gRef.divRoot.current !== null) {
                let w = parseInt(gRef.divRoot.current.offsetWidth);
                let h = parseInt(gRef.divRoot.current.offsetHeight);
                this.setState({divRootWidth: w, divRootHeight: h,});
            }
        }
    }

    render() {
        let s = 1;
        let ss = 5;
        let s0 = 10;
        let s1 = s0 * 5;
        let s2 = s0 * 10;

        if (this.props.size === "small") {
            s1 = s0 * 3;
            s2 = s0 * 6;
        }

        return <div ref={this.gRef.divRoot} className={this.props.className}>
            <Stage className="euiCanvas" width={this.state.divRootWidth} height={this.state.divRootHeight}>
                <Layer>
                    <Shape
                        sceneFunc={(context, shape) => {
                            context.beginPath();
                            context.moveTo(s + s0, s);
                            context.lineTo(s + s1, s);
                            context.lineTo(s + s1 + ss, ss + s);
                            context.lineTo(this.state.divRootWidth - s - (s1 + ss), ss + s);
                            context.lineTo(this.state.divRootWidth - s - s1, s); //5
                            context.lineTo(this.state.divRootWidth - s - s0, s);
                            context.lineTo(this.state.divRootWidth - s, s0 + s);
                            context.lineTo(this.state.divRootWidth - s, s2 + s); //8
                            context.lineTo(this.state.divRootWidth - s - ss, s2 + ss + s);
                            context.lineTo(this.state.divRootWidth - s - ss, this.state.divRootHeight - s - (s2 + ss));
                            context.lineTo(this.state.divRootWidth - s, this.state.divRootHeight - s - s2);//11
                            context.lineTo(this.state.divRootWidth - s, this.state.divRootHeight - s - s0);
                            context.lineTo(this.state.divRootWidth - s - s0, this.state.divRootHeight - s);
                            context.lineTo(this.state.divRootWidth - s - s1, this.state.divRootHeight - s); //14
                            context.lineTo(this.state.divRootWidth - s - (s1 + ss), this.state.divRootHeight - s - ss);
                            context.lineTo(s + s1 + ss, this.state.divRootHeight - s - ss);
                            context.lineTo(s + s1, this.state.divRootHeight - s);//17
                            context.lineTo(s + s0, this.state.divRootHeight - s);
                            context.lineTo(s, this.state.divRootHeight - s - s0);
                            context.lineTo(s, this.state.divRootHeight - s - s2);//20
                            context.lineTo(s + ss, this.state.divRootHeight - s - (s2 + ss));
                            context.lineTo(s + ss, s2 + ss + s);
                            context.lineTo(s, s2 + s);//23
                            context.lineTo(s, s0 + s);
                            context.lineTo(s, s0 + s);
                            context.closePath();
                            context.lineTo(this.state.divRootWidth - s - s1, s + 1);
                            context.moveTo(this.state.divRootWidth - s, s2 + s);
                            context.lineTo(this.state.divRootWidth - s, this.state.divRootHeight - s - s2);//11
                            context.moveTo(this.state.divRootWidth - s - s1, this.state.divRootHeight - s); //14
                            context.lineTo(s + s1, this.state.divRootHeight - s);//17
                            context.moveTo(s, this.state.divRootHeight - s - s2);//20
                            context.lineTo(s, s2 + s);//23
                            // (!) Konva specific method, it is very important
                            context.fillStrokeShape(shape);
                        }}
                        fill="rgb(75, 175, 255)"
                        stroke="rgb(55, 155, 225)"
                        strokeWidth={1}
                    />
                    <Rect
                        x={ss + 5}
                        y={ss + 5}
                        width={this.state.divRootWidth - (ss + 5) * 2}
                        height={this.state.divRootHeight - (ss + 5) * 2}
                        fill="rgba(255,255,255,1)"
                        stroke="rgb(55, 155, 225)"
                        strokeWidth={1}
                        // shadowBlur={3}
                    />
                </Layer>
            </Stage>
            {this.props.children}
        </div>
    }
}