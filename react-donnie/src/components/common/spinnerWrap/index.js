import React from 'react';
import {Spin} from "antd";

export default ({checkValue, trueValue, falseValue}) => (checkValue) ? <Spin /> : trueValue ? trueValue : falseValue
