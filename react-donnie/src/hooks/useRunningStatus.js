import React, {useEffect, useState} from 'react';
import {useRecoilState} from "recoil";
import {nowState} from "~/hooks/atomState";
import properties from "~/properties";
import ComUtil from "~/util/ComUtil";
import iostApi from "~/lib/iostApi";
import useInterval from "~/hooks/useInterval";

const useRunningStatus = ({
                              pool = null,
                              //forcedStartTime, forcedEndTime 에 값이 있으면 pool 의 smart-contract 의 시간보다 우선 합니다
                              forcedStartTime = null,
                              forcedEndTime = null
                          }) => {

    //checking 의 didMount가 끝나면 now에 값이 들어옴
    const [globalTimeNow] = useRecoilState(nowState)

    // stake status 정보 0: 시작전 일주일, 1: 진행중, 2: 종료 3: 풀 종료
    const [status, setStatus] = useState(null)

    // 시작시간
    const [startTime, setStartTime] = useState(null);
    // 종료시간
    const [endTime,setEndTime] = useState(null);

    // 시작시간 또는 종료까지 남은 시간
    const [duration, setDuration] = useState(null)

    //-1: preparing, 2: finished, 3: pool ended 일 경우 인터벌 안의 함수를 더이상 호출하지 않도록
    const [watching, setWatching] = useState(true)

    /* ============================= interval 제어용 변수 [START] ============================= */

    // // 시작시간 30일 전 부터 카운트다운용 인터벌 delay
    // const [startTimeDelay, setStartTimeDelay] = useState(null);
    //
    // //  종료시간 카운트다운용 인터벌 delay
    // const [endTimeDelay, setEndTimeDelay] = useState(null);

    /* ============================= interval 제어용 변수 [END] ============================= */

    //start, endTime 세팅
    useEffect(() => {
        initPoolTime()
    }, [])

    // 1. recoil state 의 now 시간이 바뀌고
    // 2. startTime 이 조회 되었을때 동작
    // ** 내부 인터벌 대신 globalTimeNow를 이용 할 경우 장점은 모든 시간이 동기화 된다는것이지만, 단점은 아래 useEffect가 1초마다 호출되게 된다는것. **
    useEffect(() => {
        if (globalTimeNow && startTime && endTime && watching) {
            refreshTime()
        }
    }, [globalTimeNow]) //1초마다 갱신

    const initPoolTime = async () => {

        //시작시간, 종료시간 조회
        const res = await Promise.all([
            getPoolStartTime(),
            getPoolPeriodFinish()
        ])

        setStartTime(res[0])
        setEndTime(res[1])
    }

    /* 진행상태 관련 */
    const refreshTime = async() => {

        const now = globalTimeNow

        //시작까지 남은시간 계산
        let startTimeDuration = startTime - now

        //종료까지 남은시간 계산
        let endTimeDuration = endTime - now

        // console.log({startTime, endTime, now})

        // [-1:Preparing] 시작전 30일 넘게 남았을 경우
        if (startTimeDuration > 0 && startTimeDuration > properties.DAYS30) {
            // console.log('===================== status 0: Preparing ===================')
            if (status !== -1) {
                setStatus(-1) //ENDED 추가 20200107
            }

            setDuration(startTimeDuration)     //시작 까지 남은 기간
        }

        // [0:Coming soon] 시작전 30일 이내 접어 들었을 때
        else if (startTimeDuration > 0 && startTimeDuration <= properties.DAYS30 ) { //ONE_WEEK * 5 ) { //5주 하드코딩 => 오픈전 30일로 변경.
            // console.log('===================== status 0: Comming soon ===================')
            if (status !== 0) {
                setStatus(0) //ENDED 추가 20200107
            }

            setDuration(startTimeDuration)     //시작 까지 남은 기간
            // setStartTimeDelay(1000);    //시작시간까지의 카운트다운 인터벌 돌리기

        }else{

            // [1:Running]
            if (endTimeDuration >= 0 && Date.parse(new Date()) <= endTime) { //30 days
                // console.log('===================== status 1: Running ===================')
                if (status !== 1) {
                    setStatus(1)
                }

                //종료 까지 남은 기간
                setDuration(endTimeDuration)
                // setEndTimeDelay(1000);  //종료시간까지의 카운트다운 인터벌 돌리기
            }
            // [2:End]
            else {


                if (status !== 2) {
                    setStatus(2)
                    setWatching(false)
                }

                // console.log('===================== status 2: Ended ===================')
            }
        }

    }

    // startTime 가져오기
    const getPoolStartTime = async () => {
        //TODO [delete]
        // return 1614143060 * 1000

        if (forcedStartTime){
            return forcedStartTime
        }

        //sec to ms
        return await iostApi.getPoolStartTime(pool) * 1000
    }

    // endTime 가져오기
    const getPoolPeriodFinish = async () => {
        //TODO [delete]
        // return 1614144650 * 1000

        if(forcedEndTime) {
            return forcedEndTime
        }
        //sec to ms
        return await iostApi.getPoolPeriodFinish(pool) * 1000
    }

    return [
        status,
        startTime,  //시작시간
        endTime,    //종료시간
        duration,   //남은기간(시작전 일 경우 시작까지 남은시간, 시작된 경우 종료까지 남은시간)
    ]
};


export default useRunningStatus;
