import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function sidebarit(){
    return(
        <footer className="app-footer">
            {/*begin::To the end*/}
            <div className="float-end d-none d-sm-inline">Talent Management System</div>
            {/*end::To the end*/}
            {/*begin::Copyright*/}
            <strong>
                Copyright © 2025&nbsp;
            </strong>
            {/*end::Copyright*/}
        </footer>

    );
}

export default sidebarit;