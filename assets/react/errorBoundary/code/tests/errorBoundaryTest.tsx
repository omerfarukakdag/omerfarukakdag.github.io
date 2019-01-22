import 'jest';
import React from 'react';
import { ErrorBoundary } from '../errorBoundary';
import { mount } from 'enzyme';

const ComponentWithError = () => {
  throw new Error('Error thrown from child component');
};

const ComponentWithRuntimeError = () => {
  let componentNames: string[] = undefined;
  let filteredList = componentNames.map(name => {
    return name.startsWith("purecomponent");
  });
  console.log(filteredList.join("-"));

  return (
    <div>Runtime error child component</div>
  );
};

const ComponentWithoutError = () => {
  return (
    <div>Child component</div>
  );
};

const UnitTestErrorViewComponent = (props: any) => {
  const error: Error = props.error;
  const componentStack: string = props.componentStack;
  return (
    <div>
      <h2>UNIT TEST ||| Oops! An error occured!</h2>
      <p><strong>Render error</strong></p>
      <p><strong>Error:</strong>{error.name}-{error.message}-{error.stack}</p>
      <p><strong>Stacktrace:</strong>{componentStack}</p>
    </div>
  );
};

describe('When no JavaScript errors are caught in a child component', () => {
  it('should render the child component', () => {
    const wrapper = mount(
      <ErrorBoundary isDevelopmentEnvironment>
        <ComponentWithoutError />
      </ErrorBoundary>
    );
    expect(wrapper.contains(<ComponentWithoutError />)).toBe(true);
  })
});

describe('When a JavaScript error is caught in a child component', () => {
  it('should catch errors with componentDidCatch', () => {
    const componentDidCatchSpy = jest.spyOn(ErrorBoundary.prototype, 'componentDidCatch');
    mount(
      <ErrorBoundary isDevelopmentEnvironment>
        <ComponentWithError />
      </ErrorBoundary>
    );
    expect(componentDidCatchSpy).toHaveBeenCalledTimes(1);
  })

  it('should catch errors with window.onerror', () => {
    const windowOnErrorSpy = jest.spyOn(ErrorBoundary.prototype, 'windowOnError');
    mount(
      <ErrorBoundary isDevelopmentEnvironment>
        <ComponentWithRuntimeError />
      </ErrorBoundary>
    );
    expect(windowOnErrorSpy).toHaveBeenCalledTimes(1);
  })

  it('should update the state to indicate an error', () => {
    const wrapper = mount(
      <ErrorBoundary isDevelopmentEnvironment>
        <ComponentWithError />
      </ErrorBoundary>
    );
    expect(wrapper.state("hasError")).toBeTruthy();
  })

  it('should not render the child component', () => {
    const wrapper = mount(
      <ErrorBoundary isDevelopmentEnvironment>
        <ComponentWithError />
      </ErrorBoundary>
    );
    expect(wrapper.contains(<ComponentWithError />)).toBe(false);
  })

  it('should call the onError callback function', () => {
    const onErrorCallback = jest.fn();
    mount(
      <ErrorBoundary ErrorViewComponent={UnitTestErrorViewComponent} onError={onErrorCallback}>
        <ComponentWithError />
      </ErrorBoundary>
    );
    expect(onErrorCallback).toHaveBeenCalledTimes(1);
  })
});