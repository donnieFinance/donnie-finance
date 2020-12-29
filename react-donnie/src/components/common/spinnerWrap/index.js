import React from 'react';
import {Spin} from "antd";

export default ({checkValue, trueValue, falseValue}) => (checkValue === null || checkValue === undefined) ? <Spin /> : checkValue === '' ? falseValue : trueValue
