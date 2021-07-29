import React from 'react'
import './KBox.scss'
import {Stage, Layer, Rect, Shape} from 'react-konva';

export default class KBoxClass extends React.Component {
    render() {
        const w = 788;
        const h = 549;
        const s = 1;
        const ss = 5;
        const s0 = 10;
        const s1 = s0 * 5;
        const s2 = s0 * 10;
        return <div className="euiKBox">
            <Stage className="euiCanvas" width={w} height={h}>
                <Layer>
                    <Shape
                        sceneFunc={(context, shape) => {
                            context.beginPath();
                            context.moveTo(s + s0, s);
                            context.lineTo(s + s1, s);
                            context.lineTo(s + s1 + ss, ss + s);
                            context.lineTo(w - s - (s1 + ss), ss + s);
                            context.lineTo(w - s - s1, s); //5
                            context.lineTo(w - s - s0, s);
                            context.lineTo(w - s, s0 + s);
                            context.lineTo(w - s, s2 + s); //8
                            context.lineTo(w - s - ss, s2 + ss + s);
                            context.lineTo(w - s - ss, h - s - (s2 + ss));
                            context.lineTo(w - s, h - s - s2);//11
                            context.lineTo(w - s, h - s - s0);
                            context.lineTo(w - s - s0, h - s);
                            context.lineTo(w - s - s1, h - s); //14
                            context.lineTo(w - s - (s1 + ss), h - s - ss);
                            context.lineTo(s + s1 + ss, h - s - ss);
                            context.lineTo(s + s1, h - s);//17
                            context.lineTo(s + s0, h - s);
                            context.lineTo(s, h - s - s0);
                            context.lineTo(s, h - s - s2);//20
                            context.lineTo(s + ss, h - s - (s2 + ss));
                            context.lineTo(s + ss, s2 + ss + s);
                            context.lineTo(s, s2 + s);//23
                            context.lineTo(s, s0 + s);
                            //context.quadraticCurveTo(150, 100, 260, 170);
                            context.closePath();
                            context.moveTo(s + s1, s+1);
                            context.lineTo(w - s - s1, s+1);
                            context.moveTo(w - s, s2 + s);
                            context.lineTo(w - s, h - s - s2);//11
                            context.moveTo(w - s - s1, h - s); //14
                            context.lineTo(s + s1, h - s);//17
                            context.moveTo(s, h - s - s2);//20
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
                        width={w - (ss + 5) * 2}
                        height={h - (ss + 5) * 2}
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