import React from 'react';

class FooterSection extends React.Component{
    constructor(props)
    {
        super(props);
        this.state = {
            param : this.props.input     }
    }
    componentDidMount()
    {

    }

    render(){
        return(
            <div className="FooterHolder">
                <div className="FooterPanel"><span>Copyright @ 2019-2020</span></div>
            </div>
        );
    }
}

export default FooterSection;