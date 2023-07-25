import '../../theme/colors.css'
import './styles.css'

import { format } from 'date-fns'

import CreateNewEvent from '../CreateNewEvent'
import Button from '../Button'
import { ModalProvider } from '../../contexts/ModalContext'
import { ArrowDirections, DateFormat, Devices, Views } from '../../constants'
import Text from '../../components/Text'
import { NavigationButton } from '../../components/NavigationButton'
import ListIcon from '../../components/ListIcon'
import Flex from '../../components/Flex'
import DropDown from '../../components/DropDown'
import ChevronDown from '../../components/ChevronDown'
import Arrow from '../../components/Arrow'

import { useCalendar } from './useCalendar'
import { CalendarProps, CombinedViewRowsType } from './types'
import { mockEvents } from './mockData'
import { END_HOUR, START_HOUR, VIEW_MODES } from './constants'

const Calendar = ({
  children,
  className,
  nextButton,
  prevButton,
  config = [],
  selectedEvent,
  view = Views.WEEK,
  endHour = END_HOUR,
  events = mockEvents,
  renderEventComponent,
  mode = Devices.DESKTOP,
  startHour = START_HOUR,
  currentDay = new Date(),
  dropDownArrow = <ChevronDown />,
  eventModal,
  newEventModal,
  onClickCell = () => {},
  onClickEvent = () => {},
  onChangeDate = () => {},
  onChangeView = () => {},
}: CalendarProps): JSX.Element => {
  const {
    isWeek,
    endDate,
    isMobile,
    viewMode,
    startDate,
    deviceMode,
    renderRows,
    currentYear,
    selectedDate,
    isEventsList,
    isDisabledNext,
    isDisabledPrevious,
    next,
    goToday,
    previous,
    handleViewMode,
    selectDateHandler,
    handleEventsList,
  } = useCalendar({
    mode,
    view,
    events,
    config,
    endHour,
    startHour,
    currentDay: new Date(currentDay),
    onChangeView,
    onChangeDate,
  })

  const View = VIEW_MODES[viewMode]

  return (
    <ModalProvider>
      <Flex
        spacing={16}
        direction="column"
        sx={{ margin: 16 }}
        className={className}
      >
        <div className={`header-grid ${isMobile ? 'header-grid_mobile' : ''}`}>
          {isMobile && isWeek ? (
            <Flex
              align="center"
              className="header-grid__back-month"
              onClick={() => handleViewMode('Month')}
            >
              <Arrow />
              <Text>{format(startDate, DateFormat.MONTH_LONG)}</Text>
            </Flex>
          ) : null}

          {!isMobile && (
            <Button
              ariaLabel="Today"
              onClick={goToday}
              className="today-button header-grid-today"
            >
              Today
            </Button>
          )}

          <Flex className="header-grid-arrows">
            <NavigationButton
              ariaLabel="Left Arrow"
              defaultButton={<Arrow />}
              customButton={prevButton}
              isDisabled={isDisabledPrevious}
              defaultStyles="button arrow-button"
              onClick={previous}
            />
            <NavigationButton
              ariaLabel="Right Arrow"
              customButton={nextButton}
              isDisabled={isDisabledNext}
              defaultStyles="button arrow-button"
              defaultButton={<Arrow direction={ArrowDirections.RIGHT} />}
              onClick={next}
            />
          </Flex>
          {isMobile && <CreateNewEvent newEventModal={newEventModal} />}
          {!isMobile && (
            <Text className="current-date header-grid-date">
              {format(startDate, DateFormat.MONTH_LONG)}
              {startDate.getMonth() !== endDate.getMonth() &&
                `-${format(endDate, DateFormat.MONTH_LONG)}`}
              {` `}
              {currentYear}
            </Text>
          )}

          <Button
            ariaLabel="List icon"
            className={`header-grid-list ${isEventsList ? 'active-list' : ''}`}
            onClick={handleEventsList}
          >
            <ListIcon />
          </Button>

          {!isMobile && (
            <DropDown
              list={Object.values(Views)}
              value={viewMode}
              onChange={handleViewMode}
              dropdownArrow={dropDownArrow}
            />
          )}
        </div>
        <div className="calendar">
          <View
            isEventsList={isEventsList}
            events={events}
            endHour={endHour}
            startHour={startHour}
            startDate={startDate}
            deviceMode={deviceMode}
            selectedDate={selectedDate}
            selectedEvent={selectedEvent}
            renderEventComponent={renderEventComponent}
            renderRows={renderRows as CombinedViewRowsType}
            eventModal={eventModal}
            onClickCell={onClickCell}
            onClickEvent={onClickEvent}
            newEventModal={newEventModal}
            selectDateHandler={selectDateHandler}
          />
        </div>
        {children}
        {isMobile && (
          <Flex className="footer">
            <Button
              ariaLabel="Today"
              onClick={goToday}
              className="today-button header-grid-today"
            >
              Today
            </Button>
          </Flex>
        )}
      </Flex>
    </ModalProvider>
  )
}

export default Calendar
