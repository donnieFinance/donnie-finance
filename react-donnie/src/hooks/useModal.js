import React, {useState, useEffect} from 'react'
// import {connect, useSelector, useDispatch} from 'react-redux'
// import ModalCountAction from '~/stores/modalCount/ModalCountAction'

// const useRedux = false

const useModal = (
    initialMode = null,
    initialSelected = null
) => {

    // const modalCount = useSelector(state => state.modalCount.count)
    // const dispatch = useDispatch()

    const [modalOpen, setModalOpen] = useState(initialMode)
    const [selected, setSelected] = useState(initialSelected)
    const toggle = () => setModalState(!modalOpen)

    // useEffect(() => {
    //
    //     if (useRedux) {
    //         const body = document.getElementsByTagName('body')[0]
    //
    //         if (modalCount > 0) {
    //             body.style.overflow = 'hidden'
    //         }else {
    //             body.style.overflow = null;
    //         }
    //     }
    //
    // }, [modalCount])

    useEffect(() => {
        // if (useRedux) {
        //     if (modalOpen === true) {
        //         dispatch(ModalCountAction.increaseModalCount())
        //     }
        // }

    }, [modalOpen])

    useEffect(() => {

        // return(() => {
        //     if (useRedux) {
        //         dispatch(ModalCountAction.decreaseModalCount())
        //     }
        // })
    }, [])

    const setModalState = state => {
        setModalOpen(state)
        if(state === false){
            setSelected(null)
        }
    }
    return [modalOpen, setModalOpen, selected, setSelected, setModalState, toggle]
}
export default useModal