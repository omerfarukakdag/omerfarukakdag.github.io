import React, { ComponentType } from 'react';
import logService from '../service/logService';

interface ErrorDetail {
    error: Error,
    errorInfo: React.ErrorInfo
}
interface ErrorBoundaryProps {
    ErrorViewComponent?: ComponentType<any>,
    children?: any,
    isDevelopmentEnvironment?: boolean,
    onError?: (errorDetail: ErrorDetail) => void
}

interface ErrorBoundaryState {
    hasError: boolean,
    errorDetail?: ErrorDetail
};

const DevelopmentEnvironmentErrorViewComponent = (props: ErrorDetail) => {
    return (
        <div>
            <h2>Development Environment ||| Oops! An error occured!</h2>
            <p><strong>Render error</strong></p>
            <p><strong>Error:</strong>{props.error.name}-{props.error.message}-{props.error.stack}</p>
            <p><strong>Stacktrace:</strong>{props.errorInfo ? props.errorInfo.componentStack : ''}</p>
        </div>
    );
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    static defaultProps = {
        isDevelopmentEnvironment: false,
        ErrorViewComponent: DevelopmentEnvironmentErrorViewComponent
    };

    constructor(props: ErrorBoundaryProps) {
        super(props);

        this.state = {
            hasError: false
        };

        this.windowOnError = this.windowOnError.bind(this);
        window.onerror = this.windowOnError;
    }
 
    /// Error Boundary komponentinin yakalayamadığı hatalar için kullanılabilir.  
    windowOnError(event: Event | string, source?: string, lineNo?: number, columnNumber?: number, error?: Error) {
        let errorMessage = `Message: ${event.toString().toLowerCase()} - Source: ${source} - Line: ${lineNo} - Column: ${columnNumber} - Error Object: ${error.name}-${error.message}-${error.stack}`;

        logService.error(errorMessage, "window.onerror");

        // When the function returns true, this prevents the firing of the default event handler.
        return true;
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        const { onError } = this.props;
        if (typeof onError === 'function') {
            try {
                onError({ error: error, errorInfo: errorInfo });
            } catch (ignoredError) { }
        }

        this.setState({
            hasError: true,
            errorDetail: {
                error: error,
                errorInfo: errorInfo
            }
        });

        let errorMessage = `Error: ${error.name}-${error.message}-${error.stack}-Error Info: ${errorInfo.componentStack}`;
        logService.error(errorMessage, "componentDidCatch");
    }

    render() {
        if (!this.state.hasError)
            return this.props.children;

        const { errorDetail } = this.state;
        const { ErrorViewComponent } = this.props;

        if (errorDetail === null)
            return;

        return (
            this.props.isDevelopmentEnvironment
                ? <DevelopmentEnvironmentErrorViewComponent {...errorDetail} />
                : <ErrorViewComponent error={errorDetail.error} componentStack={errorDetail.errorInfo ? errorDetail.errorInfo.componentStack : ''} />
        );
    }
}