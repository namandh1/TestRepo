import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

class ModalComp extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}

    }
    render() {
        let { open, toggle, handleSubmit, mode, disableSubmit } = this.props;

        return (
            <React.Fragment>
                <Modal style={{ minWidth: "60%", ...this.props.style }} isOpen={open} toggle={toggle}>
                    <ModalHeader toggle={toggle}>{this.props.modalHeader}</ModalHeader>
                    <ModalBody style={mode == 3 ? { pointerEvents: "none", ...this.props.styleBody } : this.props.styleBody}>
                        {this.props.modalBody}
                    </ModalBody>
                    {mode != 3 && mode != 0 ?
                        (this.props.modalFooter ? this.props.modalFooter :
                            <ModalFooter>

                                <Button color={disableSubmit ? "secondary" : "primary"} onClick={() => handleSubmit()}>Save</Button>
                            </ModalFooter>) : null}

                </Modal>
            </React.Fragment>
        )
    }
}
export default ModalComp;
