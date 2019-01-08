import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

export default class Form extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = props.handleSubmit ? props.handleSubmit.bind(this) : this.handleSubmit.bind(this);
    }

    handleChange(event) {
      if (!event.target.name) return;
        let form = Object.assign({}, this.state, { [event.target.name]: event.target.value });
        this.setState(form);
    }

    handleSubmit(event) {
        event.preventDefault();

        if (Object.entries(this.state).length === 0) return;

        if (this.props.isAjax === true) {
            axios[this.props.method](this.props.action || "", this.state);
        }
        else
            event.target.submit();

    }

    render() {
        return (
            <form method={this.props.method} action={this.props.action} onSubmit={this.handleSubmit} onChange={this.handleChange}>
                {this.props.children}
                <input type="submit" value="Submit" />
            </form>
        );
    }
}

Form.propTypes = {
    handleSubmit: PropTypes.func,
    action: PropTypes.string,
    isAjax: PropTypes.bool
};

Form.defaultProps = {
    isAjax: true,
    method: "get",
    action: "."
}
