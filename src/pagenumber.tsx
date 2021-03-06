import { ReactElementWidget } from '@jupyterlab/apputils';

import * as React from 'react';

/**
 * React properties for page number component.
 */
interface IProps {
  /**
   * The PDF viewer.
   */
  viewer: any;
}

/**
 * React state for page number component.
 */
interface IState {
  /**
   * The label of the current page.
   */
  currentPageLabel?: string;

  /**
   * The index of the current page in the document.
   */
  currentPageNumber: number;

  /**
   * The number of pages of the document.
   */
  pagesCount: number;

  /**
   * The string inserted by user in the input element.
   */
  userInput: string | null;
}

/**
 * Page number React component.
 */
class PageNumberComponent extends React.Component<IProps, IState> {
  public state: IState = {
    currentPageNumber: 0,
    pagesCount: 0,
    userInput: null
  };

  /**
   * Start listening PDF viewer events.
   */
  componentDidMount() {
    const { eventBus } = this.props.viewer;
    eventBus.on('firstpage', this.handlePageDataChange);
    eventBus.on('pagechanging', this.handlePageDataChange);
    eventBus.on('pagelabels', this.handlePageDataChange);
  }

  /**
   * Stop listening PDF viewer events.
   */
  componentWillUnmount() {
    const { eventBus } = this.props.viewer;
    eventBus.off('firstpage', this.handlePageDataChange);
    eventBus.off('pagechanging', this.handlePageDataChange);
    eventBus.off('pagelabels', this.handlePageDataChange);
  }

  /**
   * If user modifies the input value, store that text in `userInput` state
   * property.
   */
  handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const userInput = evt.target.value;
    this.setState({ userInput });
  };

  /**
   * Handle input element focus.
   */
  handleFocus = (evt: React.FocusEvent<HTMLInputElement>) => {
    evt.target.select();
  };

  /**
   * When the input element loses focus, change current page according to the
   * input value.
   */
  handleBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
    const { value } = evt.target;
    this.setCurrentPage(value);
  };

  /**
   * If `Enter` key is pressed, change current page according to the input
   * value.
   */
  handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Enter') {
      const { value } = evt.target as HTMLInputElement;
      this.setCurrentPage(value);
    }
  };

  /**
   * Update the state when page data change.
   */
  handlePageDataChange = () => {
    const { viewer } = this.props;
    const { currentPageLabel, currentPageNumber, pagesCount } = viewer;

    this.setState({
      currentPageLabel,
      currentPageNumber,
      pagesCount,
      userInput: null
    });
  };

  /**
   * Change current page.
   */
  setCurrentPage(pageLabel: string) {
    const { viewer } = this.props;
    viewer.currentPageLabel = pageLabel;
    // Reset user input.
    this.setState({ userInput: null });
  }

  /**
   * Render page number widget.
   */
  render() {
    const {
      currentPageLabel,
      currentPageNumber,
      pagesCount,
      userInput
    } = this.state;
    const text = currentPageLabel
      ? ` (${currentPageNumber} of ${pagesCount})`
      : ` of ${pagesCount}`;
    const value =
      userInput !== null
        ? userInput
        : currentPageLabel || currentPageNumber.toString();

    return (
      <div className="jp-PDFJSPageNumber">
        <span>
          <input
            value={value}
            onBlur={this.handleBlur}
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onKeyDown={this.handleKeyDown}
          />
          <span>{text}</span>
        </span>
      </div>
    );
  }
}

/**
 * Phosphor Widget version of PageNumberComponent.
 */
export class PageNumberWidget extends ReactElementWidget {
  constructor(props: IProps) {
    super(<PageNumberComponent {...props} />);
  }
}
