import React, { useState } from "react";
import styled from "styled-components";
import {
  Background,
  Button,
  ContentContainer,
  ErrorText,
  JoinRoomModal,
  TitleText,
} from "../../shared/components";
import { useNavigate } from "react-router-dom";
import { getPaths } from "../../shared/constants";
import { RoomCard } from "./RoomCard";
import { useAppDataApi } from "../../shared/api";
import { useEffect } from "react";

export const CreateRoomPage = () => {
  const navigate = useNavigate();
  const { getRoomModes } = useAppDataApi();

  const [open, setOpen] = useState(false);
  const [roomModes, setRoomModes] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (roomModes !== null) return;
    getRoomModes().then((data) => {
      if (!data || data.errors)
        setError(`Error: ${data?.errors[0] ?? "Unknown error"}`);
      else {
        setRoomModes(
          data.roomModes.map((roomMode) => ({
            ...roomMode,
            onClick: roomMode.disabled ? () => {} : () => setOpen(true),
          }))
        );
        setError("");
      }
    });
  }, [roomModes]);

  const ROOM_TYPES = [
    {
      title: "Normal",
      desc: "Have fun drawing with your friends.",
      disabled: false,
      onClick: () => setOpen(true),
    },
    {
      title: "Round Robin",
      desc: "Get a prompt and take turns drawing it!",
      disabled: true,
      onClick: () => {},
    },
    {
      title: "Presenting",
      desc: "Have a large audience and few presenters that control the canvas",
      disabled: true,
      onClick: () => {},
    },
  ];

  return (
    <>
      <Background>
        <Container>
          <TitleText>Canvassa</TitleText>
          <ContentContainer>
            <TitleText
              style={{
                fontSize: "4rem",
                textAlign: "center",
                marginTop: "2rem",
                color: "#767676",
              }}
            >
              Create a private room and invite your friends!
            </TitleText>
            <RoomCardsContainer>
              {error ? (
                <ErrorText error={error} />
              ) : (
                ROOM_TYPES.map((roomType, i) => (
                  <RoomCard
                    key={i}
                    title={roomType.title}
                    desc={roomType.desc}
                    disabled={roomType.disabled}
                    onClick={roomType.onClick}
                  />
                ))
              )}
            </RoomCardsContainer>
            <ButtonContainer>
              <Button
                onClick={() =>
                  navigate(getPaths.getLandingPage(), { replaced: true })
                }
              >
                Back
              </Button>
            </ButtonContainer>
          </ContentContainer>
        </Container>
      </Background>
      <JoinRoomModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 5rem;
`;

const RoomCardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 2rem 0;
`;

const ButtonContainer = styled.div`
  margin-bottom: 2rem;
`;
